import { customers, formatCurrency, orders, products, revenueByMonth } from "@/lib/data/demo-data";
import type { AgentResult } from "@/types";

const baseSteps = [
  ["Understand request", "Classified as a business analytics question"],
  ["Inspect database schema", "Reviewed customers, products, and orders"],
  ["Select relevant tables", "Joined orders with customers and products"],
  ["Generate SQL", "Created a read-only aggregation query"],
  ["Validate query", "Passed read-only and schema validation"],
  ["Execute query", "Query completed against demo dataset"],
  ["Analyze result", "Computed rankings and supporting metrics"],
  ["Generate response", "Prepared explanation and visualization"],
] as const;

const steps = () => baseSteps.map(([label, detail]) => ({ label, detail, status: "complete" as const }));

export async function runAgent(question: string): Promise<AgentResult> {
  const normalized = question.toLowerCase();
  const asksTime = normalized.includes("over time") || normalized.includes("changed") || normalized.includes("trend");
  const asksProduct = normalized.includes("product");
  const asksIndustry = normalized.includes("industry");

  if (asksTime) {
    return {
      mode: "demo",
      answer: "Revenue grew steadily across the year, with the strongest close in December at $28,540. The dataset shows a 86% lift from January to December, with a brief dip in June before the second-half acceleration.",
      sql: `SELECT\n  TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,\n  SUM(amount) AS revenue\nFROM orders\nWHERE status = 'completed'\nGROUP BY DATE_TRUNC('month', created_at)\nORDER BY DATE_TRUNC('month', created_at);`,
      steps: steps(), data: revenueByMonth, visualization: { type: "line", title: "Revenue by month", xKey: "month", yKey: "revenue" },
      metadata: { durationMs: 742, rowsReturned: 12, tables: ["orders"] },
    };
  }

  if (asksProduct) {
    const productRows = products.map((product) => ({ name: product.name, revenue: orders.filter((order) => order.product_id === product.id && order.status === "completed").reduce((sum, order) => sum + order.amount, 0) })).sort((a, b) => b.revenue - a.revenue);
    return {
      mode: "demo",
      answer: `${productRows[0].name} is the strongest product in the demo dataset, generating ${formatCurrency(productRows[0].revenue)} in completed revenue. The top three products account for ${formatCurrency(productRows.slice(0, 3).reduce((sum, row) => sum + row.revenue, 0))} combined.`,
      sql: `SELECT\n  p.name,\n  SUM(o.amount) AS revenue\nFROM orders o\nJOIN products p ON p.id = o.product_id\nWHERE o.status = 'completed'\nGROUP BY p.name\nORDER BY revenue DESC;`,
      steps: steps(), data: productRows, visualization: { type: "bar", title: "Revenue by product", xKey: "name", yKey: "revenue" },
      metadata: { durationMs: 681, rowsReturned: productRows.length, tables: ["orders", "products"] },
    };
  }

  if (asksIndustry) {
    const industryRows = customers.map((customer) => ({ name: customer.industry, revenue: orders.filter((order) => order.customer_id === customer.id && order.status === "completed").reduce((sum, order) => sum + order.amount, 0) })).reduce<Record<string, number>>((result, row) => { result[row.name] = (result[row.name] ?? 0) + row.revenue; return result; }, {});
    const data = Object.entries(industryRows).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);
    return {
      mode: "demo",
      answer: `${data[0].name} leads the dataset with ${formatCurrency(data[0].revenue)} in completed revenue. The top five industries represent ${formatCurrency(data.slice(0, 5).reduce((sum, row) => sum + row.revenue, 0))} across the demo customer base.`,
      sql: `SELECT\n  c.industry,\n  SUM(o.amount) AS revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.industry\nORDER BY revenue DESC;`,
      steps: steps(), data, visualization: { type: "bar", title: "Revenue by industry", xKey: "name", yKey: "revenue" },
      metadata: { durationMs: 819, rowsReturned: data.length, tables: ["orders", "customers"] },
    };
  }

  const customerRows = customers.map((customer) => ({ name: customer.name, revenue: orders.filter((order) => order.customer_id === customer.id && order.status === "completed").reduce((sum, order) => sum + order.amount, 0), industry: customer.industry })).sort((a, b) => b.revenue - a.revenue);
  return {
    mode: "demo",
    answer: `${customerRows[0].name} generated the most revenue at ${formatCurrency(customerRows[0].revenue)}. The top three customers together contributed ${formatCurrency(customerRows.slice(0, 3).reduce((sum, row) => sum + row.revenue, 0))}, or ${Math.round((customerRows.slice(0, 3).reduce((sum, row) => sum + row.revenue, 0) / orders.filter((order) => order.status === "completed").reduce((sum, order) => sum + order.amount, 0)) * 100)}% of completed revenue.`,
    sql: `SELECT\n  c.name,\n  c.industry,\n  SUM(o.amount) AS revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.id, c.name, c.industry\nORDER BY revenue DESC\nLIMIT 10;`,
    steps: steps(), data: customerRows, visualization: { type: "bar", title: "Top customers by revenue", xKey: "name", yKey: "revenue" },
    metadata: { durationMs: 654, rowsReturned: customerRows.length, tables: ["orders", "customers"] },
  };
}
