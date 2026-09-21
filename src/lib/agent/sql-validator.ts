import { allowedTables } from "@/lib/agent/schema";

export type SqlValidation = { valid: true; sql: string; tables: string[] } | { valid: false; error: string };

const forbidden = /\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|copy|call|do|merge|vacuum|refresh|comment)\b/i;
const relationPattern = /\b(?:from|join)\s+([a-z_][a-z0-9_]*(?:\s*\.\s*[a-z_][a-z0-9_]*)?)/gi;
const ctePattern = /\bwith\s+(?:recursive\s+)?([a-z_][a-z0-9_]*)|,\s*([a-z_][a-z0-9_]*)\s+as\s*\(/gi;

export function validateReadOnlySql(input: string): SqlValidation {
  const sql = input.trim();
  if (!sql) return { valid: false, error: "The generated query is empty." };
  if (/--|\/\*|\*\//.test(sql)) return { valid: false, error: "SQL comments are not permitted." };
  if ((sql.match(/;/g) ?? []).length > 1 || /;\s*\S/.test(sql)) return { valid: false, error: "Multiple SQL statements are not permitted." };
  if (!/^(?:select|with)\b/i.test(sql)) return { valid: false, error: "Only SELECT statements and read-only CTEs are permitted." };
  if (forbidden.test(sql)) return { valid: false, error: "The query contains a write or administrative SQL operation." };

  const ctes = new Set<string>();
  let cteMatch: RegExpExecArray | null;
  while ((cteMatch = ctePattern.exec(sql)) !== null) ctes.add((cteMatch[1] ?? cteMatch[2]).toLowerCase());
  const tables = new Set<string>();
  let relationMatch: RegExpExecArray | null;
  while ((relationMatch = relationPattern.exec(sql)) !== null) {
    const relation = relationMatch[1].replace(/\s/g, "").toLowerCase();
    const table = relation.split(".").pop() ?? relation;
    if (!ctes.has(table)) tables.add(table);
  }
  const allowed = new Set<string>(allowedTables);
  const unauthorized = [...tables].filter((table) => !allowed.has(table));
  if (unauthorized.length > 0) return { valid: false, error: `The query references an unauthorized table: ${unauthorized.join(", ")}.` };
  if (tables.size === 0) return { valid: false, error: "The query must read from an allowed demo table." };

  const limitMatch = sql.match(/\blimit\s+(\d+)/i);
  if (limitMatch && Number(limitMatch[1]) > 100) return { valid: false, error: "Result LIMIT cannot exceed 100 rows." };
  if (!limitMatch && /select\s+\*/i.test(sql) && !/\b(count|sum|avg|min|max)\s*\(/i.test(sql)) return { valid: false, error: "SELECT * queries must include LIMIT 100 or less." };

  return { valid: true, sql: sql.replace(/;\s*$/, ""), tables: [...tables] };
}
