import { Client } from "pg";
import { demoSchema } from "@/lib/agent/schema";
import { validateReadOnlySql } from "@/lib/agent/sql-validator";
import type { AgentResult, AgentStep } from "@/types";

const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
const apiKey = process.env.OPENAI_API_KEY;

const step = (label: string, detail: string, status: AgentStep["status"] = "complete"): AgentStep => ({ label, detail, status });

type ModelObject = Record<string, unknown>;
type ValidatedSqlPlan = { plan: ModelObject; sql: string; tables: string[]; retried: boolean };

export function extractJsonObject(content: string): ModelObject | null {
  const trimmed = content.trim();
  const candidates = [trimmed];
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) candidates.unshift(fenced[1].trim());

  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as ModelObject;
    } catch { /* Try extracting an object from harmless surrounding text. */ }
  }

  for (let start = trimmed.indexOf("{"); start >= 0; start = trimmed.indexOf("{", start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < trimmed.length; index += 1) {
      const character = trimmed[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') inString = true;
      else if (character === "{") depth += 1;
      else if (character === "}") {
        depth -= 1;
        if (depth === 0) {
          try {
            const parsed: unknown = JSON.parse(trimmed.slice(start, index + 1));
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as ModelObject;
          } catch { /* Keep looking for the next complete object. */ }
          break;
        }
      }
    }
  }
  return null;
}

export function parseSqlPlan(content: string): ModelObject | null {
  const parsed = extractJsonObject(content);
  if (!parsed || typeof parsed.sql !== "string" || !parsed.sql.trim()) return null;
  const visualization = parsed.visualization;
  if (!visualization || typeof visualization !== "object" || Array.isArray(visualization)) return null;
  const visualizationObject = visualization as Record<string, unknown>;
  const validType = visualizationObject.type === "bar" || visualizationObject.type === "line" || visualizationObject.type === "table" || visualizationObject.type === "metric";
  if (!validType || typeof visualizationObject.title !== "string" || !visualizationObject.title.trim()) return null;
  return parsed;
}

export function validateSqlPlanContent(content: string): { sql: string; tables: string[] } | null {
  const plan = parseSqlPlan(content);
  if (!plan) return null;
  const validation = validateReadOnlySql(plan.sql as string);
  return validation.valid ? { sql: validation.sql, tables: validation.tables } : null;
}

export async function resolveSqlPlanWithRetry(
  requestPlan: (systemPrompt: string) => Promise<string>,
  initialPrompt: string,
): Promise<ValidatedSqlPlan> {
  const firstContent = await requestPlan(initialPrompt);
  const firstValidation = validateSqlPlanContent(firstContent);
  const firstPlan = parseSqlPlan(firstContent);
  if (firstPlan && firstValidation) return { plan: firstPlan, ...firstValidation, retried: false };

  const retryPrompt = `Return ONLY one valid JSON object. No markdown fences, no explanation, no comments, and no additional text. The object MUST contain:
{"sql":"<one safe SELECT or WITH query>","reasoningSummary":"<short summary>","visualization":{"type":"bar|line|table|metric","title":"<short title>","xKey":"<column or key>","yKey":"<column or key>"}}

Use only this schema:
${demoSchema}

The SQL must be exactly one read-only SELECT or WITH query, reference only customers, products, and orders, contain no comments, mutations, DDL, or system tables, and include a LIMIT of 100 or less for row-level results. Do not return anything outside the JSON object.

Original request:
${initialPrompt}`;
  const retryContent = await requestPlan(retryPrompt);
  const retryValidation = validateSqlPlanContent(retryContent);
  const retryPlan = parseSqlPlan(retryContent);
  if (retryPlan && retryValidation) return { plan: retryPlan, ...retryValidation, retried: true };
  throw new Error("AI provider returned an invalid SQL plan.");
}

export function parseFinalAnalysis(content: string): { answer: string; structured: boolean } | null {
  const parsed = extractJsonObject(content);
  if (parsed && typeof parsed.answer === "string" && parsed.answer.trim()) return { answer: parsed.answer.trim(), structured: true };
  const fenced = content.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced && /^[\[{]/.test(fenced[1].trim())) return null;
  const naturalLanguage = content.replace(/```(?:text|markdown)?/gi, "").replace(/```/g, "").trim();
  if (naturalLanguage && !/^\{[\s\S]*\}$/.test(naturalLanguage)) return { answer: naturalLanguage, structured: false };
  return null;
}

export class AgentExecutionError extends Error {
  constructor(message: string, readonly steps: AgentStep[]) {
    super(message);
    this.name = "AgentExecutionError";
  }
}

async function callModel(system: string, user: string) {
  if (!apiKey) throw new Error("AI provider is not configured.");
  const request = (structured: boolean) => fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.1, ...(structured ? { response_format: { type: "json_object" } } : {}), messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    signal: AbortSignal.timeout(30000),
  });
  let response = await request(true);
  if (!response.ok && [400, 404, 422].includes(response.status)) response = await request(false);
  if (!response.ok) throw new Error(`AI provider returned HTTP ${response.status}.`);
  const payload = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned an empty response.");
  return content;
}

function cleanVisualization(value: unknown): AgentResult["visualization"] {
  const candidate = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const type = candidate.type === "line" || candidate.type === "table" || candidate.type === "metric" ? candidate.type : "bar";
  return { type, title: typeof candidate.title === "string" ? candidate.title : "Query results", xKey: typeof candidate.xKey === "string" ? candidate.xKey : undefined, yKey: typeof candidate.yKey === "string" ? candidate.yKey : undefined };
}

async function executeReadOnlyQuery(sql: string) {
  const client = new Client({ connectionString: process.env.DATAPILOT_READONLY_DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET TRANSACTION READ ONLY");
    await client.query("SET LOCAL statement_timeout = '8000ms'");
    const result = await client.query(sql);
    await client.query("ROLLBACK");
    return result.rows as Record<string, string | number>[];
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally { await client.end(); }
}

export async function runRealAgent(question: string): Promise<AgentResult> {
  const startedAt = Date.now();
  const steps: AgentStep[] = [step("Understand request", "Received a business analytics question"), step("Inspect schema", "Loaded the known PostgreSQL schema")];
  let activeStep = "Generate query";
  try {
    const system = `You are DataPilot's SQL planning service. Return JSON only with sql, reasoningSummary, visualization. Never reveal chain-of-thought. Use only these tables and columns:\n${demoSchema}\nOnly write a single read-only SELECT or WITH query. Include a LIMIT no greater than 100 for row-level results. Do not use comments, mutations, DDL, system tables, or unsupported functions. The visualization object must include type and title.`;
    const resolvedPlan = await resolveSqlPlanWithRetry((prompt) => callModel(system, prompt), question);
    const plan = resolvedPlan.plan;
    const sql = resolvedPlan.sql;
    if (resolvedPlan.retried) steps.push(step("Generate query", "Retried once after the provider returned an invalid plan format"));
    else steps.push(step("Generate query", "Received a structured read-only query plan"));
    activeStep = "Validate query";
    steps.push(step("Validate query", `Passed read-only SQL validation for ${resolvedPlan.tables.join(", ")}`));
    activeStep = "Execute query";
    if (!process.env.DATAPILOT_READONLY_DB_URL) throw new Error("The DataPilot read-only database connection is not configured.");
    const data = await executeReadOnlyQuery(sql);
    steps.push(step("Execute query", `Returned ${data.length} rows from PostgreSQL`));
    activeStep = "Analyze results";
    const analysisContent = await callModel("Return JSON only with a concise answer string. Explain the result for a business user in no more than three sentences. Do not mention hidden reasoning or credentials. If structured JSON is unavailable, return a concise plain-text answer.", JSON.stringify({ question, result: data.slice(0, 100) }));
    const analysis = parseFinalAnalysis(analysisContent);
    if (!analysis) throw new Error("AI provider returned no usable result analysis.");
    steps.push(step("Analyze results", analysis.structured ? "Summarized the returned rows using structured output" : "Used the provider's usable plain-text result"));
    steps.push(step("Generate response", "Prepared the answer and visualization metadata"));
    return { answer: analysis.answer, sql, steps, data, visualization: cleanVisualization(plan.visualization), metadata: { durationMs: Date.now() - startedAt, rowsReturned: data.length, tables: resolvedPlan.tables }, mode: "live" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The live agent could not complete this request.";
    throw new AgentExecutionError(message, [...steps, step(activeStep, "This step did not complete.", "failed")]);
  }
}

export function hasRealAgentConfig() {
  return Boolean(apiKey && process.env.DATAPILOT_READONLY_DB_URL);
}
