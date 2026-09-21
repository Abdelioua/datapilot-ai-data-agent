import type { Customer, Order, Product } from "@/types";

export const customers: Customer[] = [
  { id: "cus_001", name: "Northstar Health", industry: "Healthcare", country: "United States", created_at: "2023-02-14" },
  { id: "cus_002", name: "Atlas Freight", industry: "Logistics", country: "Canada", created_at: "2023-03-02" },
  { id: "cus_003", name: "Lumen Studio", industry: "Creative Services", country: "United Kingdom", created_at: "2023-04-19" },
  { id: "cus_004", name: "Brightline Retail", industry: "Retail", country: "Australia", created_at: "2023-05-08" },
  { id: "cus_005", name: "Vertex Energy", industry: "Energy", country: "United States", created_at: "2023-06-27" },
  { id: "cus_006", name: "Cedar & Co.", industry: "Professional Services", country: "Germany", created_at: "2023-07-11" },
  { id: "cus_007", name: "Mosaic Foods", industry: "Food & Beverage", country: "France", created_at: "2023-08-03" },
  { id: "cus_008", name: "Redwood Labs", industry: "Technology", country: "United States", created_at: "2023-09-22" },
  { id: "cus_009", name: "Harbor Hotels", industry: "Hospitality", country: "Spain", created_at: "2023-10-15" },
  { id: "cus_010", name: "Evergreen Schools", industry: "Education", country: "Netherlands", created_at: "2023-11-06" },
];

export const products: Product[] = [
  { id: "prd_001", name: "Insight Pro", category: "Analytics", price: 2490 },
  { id: "prd_002", name: "Signal Monitor", category: "Monitoring", price: 1490 },
  { id: "prd_003", name: "Data Connect", category: "Integrations", price: 890 },
  { id: "prd_004", name: "Forecast Suite", category: "Planning", price: 3290 },
  { id: "prd_005", name: "Team Workspace", category: "Collaboration", price: 590 },
  { id: "prd_006", name: "Audit Center", category: "Governance", price: 1790 },
];

export const orders: Order[] = [
  { id: "ord_1001", customer_id: "cus_001", product_id: "prd_004", quantity: 3, amount: 9870, status: "completed", created_at: "2024-01-12" },
  { id: "ord_1002", customer_id: "cus_008", product_id: "prd_001", quantity: 4, amount: 9960, status: "completed", created_at: "2024-01-19" },
  { id: "ord_1003", customer_id: "cus_002", product_id: "prd_002", quantity: 5, amount: 7450, status: "completed", created_at: "2024-02-06" },
  { id: "ord_1004", customer_id: "cus_004", product_id: "prd_003", quantity: 8, amount: 7120, status: "completed", created_at: "2024-02-21" },
  { id: "ord_1005", customer_id: "cus_005", product_id: "prd_004", quantity: 2, amount: 6580, status: "completed", created_at: "2024-03-03" },
  { id: "ord_1006", customer_id: "cus_003", product_id: "prd_005", quantity: 12, amount: 7080, status: "completed", created_at: "2024-03-18" },
  { id: "ord_1007", customer_id: "cus_001", product_id: "prd_001", quantity: 3, amount: 7470, status: "completed", created_at: "2024-04-08" },
  { id: "ord_1008", customer_id: "cus_007", product_id: "prd_003", quantity: 9, amount: 8010, status: "completed", created_at: "2024-04-26" },
  { id: "ord_1009", customer_id: "cus_008", product_id: "prd_004", quantity: 3, amount: 9870, status: "completed", created_at: "2024-05-07" },
  { id: "ord_1010", customer_id: "cus_006", product_id: "prd_006", quantity: 4, amount: 7160, status: "completed", created_at: "2024-05-22" },
  { id: "ord_1011", customer_id: "cus_009", product_id: "prd_002", quantity: 5, amount: 7450, status: "processing", created_at: "2024-06-11" },
  { id: "ord_1012", customer_id: "cus_002", product_id: "prd_004", quantity: 2, amount: 6580, status: "completed", created_at: "2024-06-18" },
  { id: "ord_1013", customer_id: "cus_005", product_id: "prd_001", quantity: 4, amount: 9960, status: "completed", created_at: "2024-07-02" },
  { id: "ord_1014", customer_id: "cus_010", product_id: "prd_005", quantity: 18, amount: 10620, status: "completed", created_at: "2024-07-21" },
  { id: "ord_1015", customer_id: "cus_001", product_id: "prd_006", quantity: 3, amount: 5370, status: "completed", created_at: "2024-08-04" },
  { id: "ord_1016", customer_id: "cus_004", product_id: "prd_001", quantity: 2, amount: 4980, status: "completed", created_at: "2024-08-18" },
  { id: "ord_1017", customer_id: "cus_008", product_id: "prd_002", quantity: 6, amount: 8940, status: "completed", created_at: "2024-09-05" },
  { id: "ord_1018", customer_id: "cus_007", product_id: "prd_004", quantity: 2, amount: 6580, status: "completed", created_at: "2024-09-23" },
  { id: "ord_1019", customer_id: "cus_006", product_id: "prd_003", quantity: 7, amount: 6230, status: "completed", created_at: "2024-10-09" },
  { id: "ord_1020", customer_id: "cus_003", product_id: "prd_001", quantity: 2, amount: 4980, status: "refunded", created_at: "2024-10-24" },
  { id: "ord_1021", customer_id: "cus_009", product_id: "prd_004", quantity: 3, amount: 9870, status: "completed", created_at: "2024-11-13" },
  { id: "ord_1022", customer_id: "cus_010", product_id: "prd_006", quantity: 4, amount: 7160, status: "completed", created_at: "2024-11-28" },
  { id: "ord_1023", customer_id: "cus_005", product_id: "prd_002", quantity: 6, amount: 8940, status: "completed", created_at: "2024-12-09" },
  { id: "ord_1024", customer_id: "cus_002", product_id: "prd_001", quantity: 3, amount: 7470, status: "completed", created_at: "2024-12-19" },
];

export const revenueByMonth = [
  { month: "Jan", revenue: 15320 }, { month: "Feb", revenue: 18120 }, { month: "Mar", revenue: 19740 },
  { month: "Apr", revenue: 20310 }, { month: "May", revenue: 22840 }, { month: "Jun", revenue: 19060 },
  { month: "Jul", revenue: 26580 }, { month: "Aug", revenue: 21040 }, { month: "Sep", revenue: 23820 },
  { month: "Oct", revenue: 21640 }, { month: "Nov", revenue: 25120 }, { month: "Dec", revenue: 28540 },
];

export const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
