-- ========================================================================
-- SmartBiz: Demonstration SQL Queries for Academic Viva & DBMS Concepts
-- ========================================================================

-- ------------------------------------------------------------------------
-- 1. BASIC SELECT, PROJECTION & FILTERING (WHERE, ORDER BY, LIMIT)
-- Concept: Retrieve active products with healthy stock sorted by price.
-- ------------------------------------------------------------------------
SELECT 
    product_id, 
    sku_code, 
    product_name, 
    selling_price, 
    current_stock
FROM products
WHERE current_stock > 10 AND is_active = 1
ORDER BY selling_price DESC;

-- ------------------------------------------------------------------------
-- 2. INNER JOIN (Products & Categories)
-- Concept: Combine records from two related tables based on foreign key.
-- ------------------------------------------------------------------------
SELECT 
    p.sku_code,
    p.product_name,
    c.category_name,
    p.cost_price,
    p.selling_price,
    (p.selling_price - p.cost_price) AS profit_margin_per_unit,
    p.current_stock
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
ORDER BY c.category_name, p.product_name;

-- ------------------------------------------------------------------------
-- 3. MULTI-TABLE JOIN (Sales Orders, Customers, Users/Cashiers)
-- Concept: 3-way join with LEFT JOIN to accommodate walk-in customers.
-- ------------------------------------------------------------------------
SELECT 
    so.invoice_number,
    so.order_date,
    COALESCE(c.full_name, 'Walk-in Guest') AS customer_name,
    COALESCE(c.phone, 'N/A') AS customer_phone,
    u.full_name AS billed_by,
    so.net_payable,
    so.payment_status
FROM sales_orders so
LEFT JOIN customers c ON so.customer_id = c.customer_id
INNER JOIN users u ON so.cashier_id = u.user_id
ORDER BY so.order_date DESC;

-- ------------------------------------------------------------------------
-- 4. AGGREGATE FUNCTIONS & GROUP BY (Sales Breakdown by Category)
-- Concept: SUM, COUNT, AVG aggregations grouped by category.
-- ------------------------------------------------------------------------
SELECT 
    c.category_name,
    COUNT(DISTINCT si.order_id) AS total_orders_involved,
    SUM(si.quantity) AS total_items_sold,
    ROUND(SUM(si.line_total), 2) AS total_revenue,
    ROUND(AVG(si.unit_price), 2) AS avg_selling_price
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN sales_items si ON p.product_id = si.product_id
GROUP BY c.category_id, c.category_name
ORDER BY total_revenue DESC;

-- ------------------------------------------------------------------------
-- 5. GROUP BY WITH HAVING CLAUSE
-- Concept: Filter aggregated groups (Categories generating > 1,000 revenue).
-- ------------------------------------------------------------------------
SELECT 
    c.category_name,
    COUNT(p.product_id) AS product_count,
    SUM(si.quantity) AS total_units_sold,
    SUM(si.line_total) AS gross_sales
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN sales_items si ON p.product_id = si.product_id
GROUP BY c.category_id, c.category_name
HAVING SUM(si.line_total) >= 1000.00
ORDER BY gross_sales DESC;

-- ------------------------------------------------------------------------
-- 6. SUBQUERY (Non-Correlated Subquery)
-- Concept: Find customers whose outstanding credit is above the average debt.
-- ------------------------------------------------------------------------
SELECT 
    customer_id,
    full_name,
    phone,
    outstanding_balance,
    credit_limit
FROM customers
WHERE outstanding_balance > (
    SELECT AVG(outstanding_balance) 
    FROM customers 
    WHERE outstanding_balance > 0
);

-- ------------------------------------------------------------------------
-- 7. SUBQUERY WITH IN / NOT IN (Unsold Products / Dead Inventory)
-- Concept: Identify products that have never been sold in any sales order.
-- ------------------------------------------------------------------------
SELECT 
    p.product_id,
    p.sku_code,
    p.product_name,
    p.current_stock,
    p.selling_price
FROM products p
WHERE p.product_id NOT IN (
    SELECT DISTINCT product_id 
    FROM sales_items
);

-- ------------------------------------------------------------------------
-- 8. QUERYING VIEWS (Low Stock Alert View)
-- Concept: Demonstrate abstraction and simplification using SQL Views.
-- ------------------------------------------------------------------------
SELECT * FROM view_low_stock_products;

-- ------------------------------------------------------------------------
-- 9. PAYMENT MODE WISE REVENUE BREAKDOWN (CASE / GROUP BY)
-- Concept: Business distribution across UPI, Cash, Card, Credit.
-- ------------------------------------------------------------------------
SELECT 
    payment_mode,
    COUNT(payment_id) AS transaction_count,
    SUM(amount) AS total_collected,
    ROUND(SUM(amount) * 100.0 / (SELECT SUM(amount) FROM payments), 1) AS percentage_share
FROM payments
GROUP BY payment_mode
ORDER BY total_collected DESC;
