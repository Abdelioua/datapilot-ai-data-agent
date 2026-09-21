insert into public.customers (id, name, industry, country, created_at) values
('cus_001', 'Northstar Health', 'Healthcare', 'United States', '2023-02-14'),
('cus_002', 'Atlas Freight', 'Logistics', 'Canada', '2023-03-02'),
('cus_003', 'Lumen Studio', 'Creative Services', 'United Kingdom', '2023-04-19'),
('cus_004', 'Brightline Retail', 'Retail', 'Australia', '2023-05-08'),
('cus_005', 'Vertex Energy', 'Energy', 'United States', '2023-06-27'),
('cus_006', 'Cedar & Co.', 'Professional Services', 'Germany', '2023-07-11'),
('cus_007', 'Mosaic Foods', 'Food & Beverage', 'France', '2023-08-03'),
('cus_008', 'Redwood Labs', 'Technology', 'United States', '2023-09-22'),
('cus_009', 'Harbor Hotels', 'Hospitality', 'Spain', '2023-10-15'),
('cus_010', 'Evergreen Schools', 'Education', 'Netherlands', '2023-11-06')
on conflict (id) do nothing;

insert into public.products (id, name, category, price) values
('prd_001', 'Insight Pro', 'Analytics', 2490),
('prd_002', 'Signal Monitor', 'Monitoring', 1490),
('prd_003', 'Data Connect', 'Integrations', 890),
('prd_004', 'Forecast Suite', 'Planning', 3290),
('prd_005', 'Team Workspace', 'Collaboration', 590),
('prd_006', 'Audit Center', 'Governance', 1790)
on conflict (id) do nothing;

insert into public.orders (id, customer_id, product_id, quantity, amount, status, created_at) values
('ord_1001', 'cus_001', 'prd_004', 3, 9870, 'completed', '2024-01-12'),
('ord_1002', 'cus_008', 'prd_001', 4, 9960, 'completed', '2024-01-19'),
('ord_1003', 'cus_002', 'prd_002', 5, 7450, 'completed', '2024-02-06'),
('ord_1004', 'cus_004', 'prd_003', 8, 7120, 'completed', '2024-02-21'),
('ord_1005', 'cus_005', 'prd_004', 2, 6580, 'completed', '2024-03-03'),
('ord_1006', 'cus_003', 'prd_005', 12, 7080, 'completed', '2024-03-18'),
('ord_1007', 'cus_001', 'prd_001', 3, 7470, 'completed', '2024-04-08'),
('ord_1008', 'cus_007', 'prd_003', 9, 8010, 'completed', '2024-04-26'),
('ord_1009', 'cus_008', 'prd_004', 3, 9870, 'completed', '2024-05-07'),
('ord_1010', 'cus_006', 'prd_006', 4, 7160, 'completed', '2024-05-22'),
('ord_1011', 'cus_009', 'prd_002', 5, 7450, 'processing', '2024-06-11'),
('ord_1012', 'cus_002', 'prd_004', 2, 6580, 'completed', '2024-06-18'),
('ord_1013', 'cus_005', 'prd_001', 4, 9960, 'completed', '2024-07-02'),
('ord_1014', 'cus_010', 'prd_005', 18, 10620, 'completed', '2024-07-21'),
('ord_1015', 'cus_001', 'prd_006', 3, 5370, 'completed', '2024-08-04'),
('ord_1016', 'cus_004', 'prd_001', 2, 4980, 'completed', '2024-08-18'),
('ord_1017', 'cus_008', 'prd_002', 6, 8940, 'completed', '2024-09-05'),
('ord_1018', 'cus_007', 'prd_004', 2, 6580, 'completed', '2024-09-23'),
('ord_1019', 'cus_006', 'prd_003', 7, 6230, 'completed', '2024-10-09'),
('ord_1020', 'cus_003', 'prd_001', 2, 4980, 'refunded', '2024-10-24'),
('ord_1021', 'cus_009', 'prd_004', 3, 9870, 'completed', '2024-11-13'),
('ord_1022', 'cus_010', 'prd_006', 4, 7160, 'completed', '2024-11-28'),
('ord_1023', 'cus_005', 'prd_002', 6, 8940, 'completed', '2024-12-09'),
('ord_1024', 'cus_002', 'prd_001', 3, 7470, 'completed', '2024-12-19')
on conflict (id) do nothing;
