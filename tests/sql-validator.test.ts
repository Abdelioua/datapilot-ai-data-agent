import assert from "node:assert/strict";
import test from "node:test";
import { extractJsonObject, parseFinalAnalysis, parseSqlPlan, resolveSqlPlanWithRetry } from "../src/lib/agent/real-agent";
import { validateReadOnlySql } from "../src/lib/agent/sql-validator";

test("parses clean structured JSON from the model", () => {
  assert.deepEqual(extractJsonObject('{"sql":"SELECT 1","visualization":{"type":"metric"}}'), { sql: "SELECT 1", visualization: { type: "metric" } });
});

test("parses JSON wrapped in markdown fences", () => {
  assert.deepEqual(parseSqlPlan('```json\n{"sql":"SELECT name FROM customers LIMIT 10","visualization":{"type":"table","title":"Customers"}}\n```')?.sql, "SELECT name FROM customers LIMIT 10");
});

test("extracts JSON with harmless surrounding text", () => {
  assert.equal(parseSqlPlan('Here is the plan:\n{"sql":"SELECT name FROM customers LIMIT 10","visualization":{"type":"table","title":"Customers"}}\nThat is all.')?.sql, "SELECT name FROM customers LIMIT 10");
});

test("rejects malformed SQL-plan responses before execution", () => {
  assert.equal(parseSqlPlan("I could not produce a query."), null);
  assert.equal(parseSqlPlan('{"sql":"SELECT 1"}'), null);
});

const validPlan = JSON.stringify({ sql: "SELECT name FROM customers LIMIT 5", reasoningSummary: "Rank customers", visualization: { type: "table", title: "Customers" } });

test("accepts a valid plan on the first attempt", async () => {
  let calls = 0;
  const result = await resolveSqlPlanWithRetry(async () => { calls += 1; return validPlan; }, "Which customers?");
  assert.equal(calls, 1);
  assert.equal(result.retried, false);
});

test("retries once after malformed output and accepts a valid plan", async () => {
  let calls = 0;
  const result = await resolveSqlPlanWithRetry(async () => { calls += 1; return calls === 1 ? "I cannot format that." : validPlan; }, "Which customers?");
  assert.equal(calls, 2);
  assert.equal(result.retried, true);
});

test("fails safely after malformed first and second plan responses", async () => {
  await assert.rejects(() => resolveSqlPlanWithRetry(async () => "not a plan", "Which customers?"), /invalid SQL plan/);
});

test("rejects malicious SQL returned by the retry", async () => {
  const malicious = JSON.stringify({ sql: "DROP TABLE customers", visualization: { type: "table", title: "Customers" } });
  await assert.rejects(() => resolveSqlPlanWithRetry(async (prompt) => prompt.includes("Original request") ? malicious : "malformed", "Which customers?"), /invalid SQL plan/);
});

test("rejects valid-looking JSON with invalid SQL", async () => {
  const invalid = JSON.stringify({ sql: "SELECT * FROM secret_table", visualization: { type: "table", title: "Secret" } });
  await assert.rejects(() => resolveSqlPlanWithRetry(async () => invalid, "Which customers?"), /invalid SQL plan/);
});

test("falls back to usable plain-text final analysis", () => {
  assert.deepEqual(parseFinalAnalysis("Revenue increased 18% month over month."), { answer: "Revenue increased 18% month over month.", structured: false });
  assert.deepEqual(parseFinalAnalysis("```text\nRevenue increased 18%.\n```"), { answer: "Revenue increased 18%.", structured: false });
});

test("prefers structured final analysis and rejects unusable output", () => {
  assert.deepEqual(parseFinalAnalysis('Summary: {"answer":"Revenue increased 18%."}'), { answer: "Revenue increased 18%.", structured: true });
  assert.equal(parseFinalAnalysis("```json\n{\"result\":\"missing answer\"}\n```"), null);
  assert.equal(parseFinalAnalysis("{not valid json}"), null);
});

test("accepts a simple read-only select", () => {
  const result = validateReadOnlySql("SELECT name, industry FROM customers LIMIT 10;");
  assert.equal(result.valid, true);
});

test("accepts joins across allowed tables", () => {
  const result = validateReadOnlySql("SELECT c.name, SUM(o.amount) AS revenue FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name;");
  assert.equal(result.valid, true);
  if (result.valid) assert.deepEqual(result.tables.sort(), ["customers", "orders"]);
});

test("accepts read-only CTEs", () => {
  const result = validateReadOnlySql("WITH totals AS (SELECT customer_id, SUM(amount) AS revenue FROM orders GROUP BY customer_id) SELECT * FROM totals LIMIT 10;");
  assert.equal(result.valid, true);
});

for (const sql of [
  "DROP TABLE customers;",
  "SELECT * FROM customers; DELETE FROM customers;",
  "UPDATE customers SET name='x';",
  "SELECT * FROM secret_table LIMIT 10;",
  "SELECT * FROM customers -- bypass\nLIMIT 10;",
  "SELECT * FROM customers; SELECT * FROM products;",
]) {
  test(`rejects unsafe SQL: ${sql.slice(0, 24)}`, () => assert.equal(validateReadOnlySql(sql).valid, false));
}

test("rejects oversized and unbounded row-level queries", () => {
  assert.equal(validateReadOnlySql("SELECT * FROM customers;").valid, false);
  assert.equal(validateReadOnlySql("SELECT * FROM customers LIMIT 101;").valid, false);
});