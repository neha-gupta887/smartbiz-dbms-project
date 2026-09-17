import express from 'express';
import db from '../../database/db.js';

const router = express.Router();

// Pre-defined demo queries with descriptions
const DEMO_QUERIES = [
    {
        id: 'q1',
        title: 'Top 5 Best-Selling Products by Revenue',
        concept: 'INNER JOIN, GROUP BY, Aggregate SUM(), ORDER BY, LIMIT',
        sql: `SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    SUM(si.quantity) AS total_units_sold,
    ROUND(SUM(si.line_total), 2) AS total_revenue
FROM sales_items si
INNER JOIN products p ON si.product_id = p.product_id
INNER JOIN categories c ON p.category_id = c.category_id
GROUP BY p.product_id, p.product_name, c.category_name
ORDER BY total_revenue DESC
LIMIT 5;`
    },
    {
        id: 'q2',
        title: 'Low-Stock Products with Supplier Contact',
        concept: 'JOIN across Catalog & Categories with WHERE filter',
        sql: `SELECT 
    p.product_id,
    p.sku_code,
    p.product_name,
    c.category_name,
    p.current_stock,
    p.reorder_level,
    (p.reorder_level - p.current_stock) AS stock_deficit
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.current_stock <= p.reorder_level AND p.is_active = 1
ORDER BY p.current_stock ASC;`
    },
    {
        id: 'q3',
        title: 'Category Revenue with Threshold Filter',
        concept: 'GROUP BY with HAVING Clause',
        sql: `SELECT 
    c.category_name,
    COUNT(DISTINCT si.order_id) AS total_orders,
    SUM(si.quantity) AS units_sold,
    ROUND(SUM(si.line_total), 2) AS category_revenue
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN sales_items si ON p.product_id = si.product_id
GROUP BY c.category_id, c.category_name
HAVING SUM(si.line_total) >= 1000.00
ORDER BY category_revenue DESC;`
    },
    {
        id: 'q4',
        title: 'Customers with Outstanding Balance Above Average',
        concept: 'Non-Correlated Subquery (SELECT AVG(...) in WHERE)',
        sql: `SELECT 
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
)
ORDER BY outstanding_balance DESC;`
    },
    {
        id: 'q5',
        title: 'Dead Inventory / Unsold Products',
        concept: 'Subquery with NOT IN clause',
        sql: `SELECT 
    p.product_id,
    p.sku_code,
    p.product_name,
    p.current_stock,
    p.selling_price
FROM products p
WHERE p.product_id NOT IN (
    SELECT DISTINCT product_id 
    FROM sales_items
);`
    },
    {
        id: 'q6',
        title: 'Multi-Table Sales Ledger (Orders + Customers + Cashiers)',
        concept: '3-Way JOIN with LEFT JOIN for walk-in buyers',
        sql: `SELECT 
    so.invoice_number,
    so.order_date,
    COALESCE(c.full_name, 'Walk-in Guest') AS customer_name,
    u.full_name AS cashier_name,
    so.subtotal,
    so.tax_amount,
    so.discount_amount,
    so.net_payable,
    so.payment_status
FROM sales_orders so
LEFT JOIN customers c ON so.customer_id = c.customer_id
INNER JOIN users u ON so.cashier_id = u.user_id
ORDER BY so.order_date DESC
LIMIT 10;`
    },
    {
        id: 'q7',
        title: 'Payment Channel Revenue Share (%)',
        concept: 'Aggregates, Subquery inside SELECT, percentage calculation',
        sql: `SELECT 
    payment_mode,
    COUNT(payment_id) AS total_transactions,
    SUM(amount) AS total_amount_collected,
    ROUND(SUM(amount) * 100.0 / (SELECT SUM(amount) FROM payments), 2) AS percentage_of_revenue
FROM payments
GROUP BY payment_mode
ORDER BY total_amount_collected DESC;`
    },
    {
        id: 'q8',
        title: 'Query View: Low Stock Monitor View',
        concept: 'SQL View execution (Abstraction & Security)',
        sql: `SELECT * FROM view_low_stock_products;`
    }
];

// GET list of preset showcase queries
router.get('/queries', (req, res) => {
    res.json({ success: true, data: DEMO_QUERIES });
});

// GET all database tables and views with row counts
router.get('/tables', (req, res) => {
    try {
        const items = db.prepare(`
            SELECT name, type 
            FROM sqlite_master 
            WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
            ORDER BY type ASC, name ASC
        `).all();

        const enriched = items.map(item => {
            let rowCount = null;
            if (item.type === 'table') {
                try {
                    rowCount = db.prepare(`SELECT COUNT(*) as count FROM "${item.name}"`).get().count;
                } catch {
                    rowCount = 0;
                }
            }
            return {
                ...item,
                rowCount
            };
        });

        res.json({ success: true, data: enriched });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET table schema and constraints details
router.get('/tables/:tableName', (req, res) => {
    const { tableName } = req.params;
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ success: false, error: 'Invalid table name' });
    }
    try {
        const columns = db.prepare(`PRAGMA table_info("${tableName}")`).all();
        const foreignKeys = db.prepare(`PRAGMA foreign_key_list("${tableName}")`).all();
        res.json({
            success: true,
            data: {
                tableName,
                columns,
                foreignKeys
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST execute raw or preset SQL query
router.post('/execute', (req, res) => {
    const { sql } = req.body;

    if (!sql || !sql.trim()) {
        return res.status(400).json({ success: false, error: 'SQL query cannot be empty' });
    }

    const trimmed = sql.trim();
    const startTime = performance.now();

    try {
        // Only allow SELECT or PRAGMA for safe playground execution
        const isSelect = /^(SELECT|PRAGMA|EXPLAIN)\b/i.test(trimmed);

        if (!isSelect) {
            // If it's a DDL/DML, execute it with .run()
            const info = db.prepare(trimmed).run();
            const executionTimeMs = (performance.now() - startTime).toFixed(2);
            return res.json({
                success: true,
                isMutation: true,
                affectedRows: info.changes,
                executionTimeMs,
                message: `Query executed successfully. ${info.changes} row(s) affected.`
            });
        }

        const rows = db.prepare(trimmed).all();
        const executionTimeMs = (performance.now() - startTime).toFixed(2);
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

        res.json({
            success: true,
            isMutation: false,
            columns,
            rows,
            rowCount: rows.length,
            executionTimeMs
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

export default router;
