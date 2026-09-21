export type Customer = {
  id: string;
  name: string;
  industry: string;
  country: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
};

export type Order = {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  amount: number;
  status: "completed" | "processing" | "refunded";
  created_at: string;
};

export type Visualization = {
  type: "bar" | "line" | "table" | "metric";
  title: string;
  xKey?: string;
  yKey?: string;
};

export type AgentStep = {
  label: string;
  detail: string;
  status: "complete" | "active" | "failed";
};

export type AgentResult = {
  answer: string;
  sql: string;
  steps: AgentStep[];
  data: Record<string, string | number>[];
  visualization: Visualization;
  metadata: {
    durationMs: number;
    rowsReturned: number;
    tables: string[];
  };
  mode?: "demo" | "live";
};

export type AgentRun = AgentResult & {
  id: string;
  question: string;
  createdAt: string;
  status: "Completed" | "Running";
};
