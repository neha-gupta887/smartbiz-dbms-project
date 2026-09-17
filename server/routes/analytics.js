import express from 'express';
import db from '../../database/db.js';

const router = express.Router();

// GET Dashboard Overview Metrics
router.get('/dashboard', (req, res) => {
    try {
        // 1. Total revenue
        const revenue = db.prepare('SELECT COALESCE(SUM(net_payable), 0) as total_revenue, COUNT(*) as total_orders FROM sales_orders').get();

        // 2. Total items & inventory value
        const inventory = db.prepare(`
            SELECT 
                COUNT(*) as total_products,
                COALESCE(SUM(current_stock), 0) as total_stock_units,
                COALESCE(SUM(current_stock * cost_price), 0) as total_inventory_cost_value,
                COALESCE(SUM(current_stock * selling_price), 0) as total_inventory_retail_value
            FROM products
            WHERE is_active = 1
        `).get();

        // 3. Low stock count
        const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM view_low_stock_products').get().count;

        // 4. Customer balance due
        const customerDebt = db.prepare('SELECT COALESCE(SUM(outstanding_balance), 0) as total_due FROM customers').get().total_due;

        // 5. Recent 5 orders
        const recentOrders = db.prepare(`
            SELECT so.order_id, so.invoice_number, so.order_date, so.net_payable, so.payment_status,
                   COALESCE(c.full_name, 'Walk-in') as customer_name
            FROM sales_orders so
            LEFT JOIN customers c ON so.customer_id = c.customer_id
            ORDER BY so.order_date DESC
            LIMIT 5
        `).all();

        // 6. Top 5 selling products
        const topProducts = db.prepare(`
            SELECT p.product_name, c.category_name, SUM(si.quantity) as units_sold, SUM(si.line_total) as revenue
            FROM sales_items si
            JOIN products p ON si.product_id = p.product_id
            JOIN categories c ON p.category_id = c.category_id
            GROUP BY p.product_id
            ORDER BY revenue DESC
            LIMIT 5
        `).all();

        // 7. Category wise sales breakdown
        const categorySales = db.prepare(`
            SELECT c.category_name, SUM(si.line_total) as total_sales, COUNT(DISTINCT si.order_id) as orders_count
            FROM categories c
            JOIN products p ON c.category_id = p.category_id
            JOIN sales_items si ON p.product_id = si.product_id
            GROUP BY c.category_id
            ORDER BY total_sales DESC
        `).all();

        // 8. Payment mode breakdown
        const paymentModes = db.prepare(`
            SELECT payment_mode, SUM(amount) as total_collected, COUNT(*) as txn_count
            FROM payments
            GROUP BY payment_mode
            ORDER BY total_collected DESC
        `).all();

        res.json({
            success: true,
            data: {
                total_revenue: revenue.total_revenue,
                total_orders: revenue.total_orders,
                total_products: inventory.total_products,
                total_stock_units: inventory.total_stock_units,
                inventory_value: inventory.total_inventory_retail_value,
                low_stock_count: lowStockCount,
                customer_debt: customerDebt,
                recent_orders: recentOrders,
                top_products: topProducts,
                category_sales: categorySales,
                payment_modes: paymentModes
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET Low Stock Alerts
router.get('/low-stock', (req, res) => {
    try {
        const lowStock = db.prepare('SELECT * FROM view_low_stock_products ORDER BY current_stock ASC').all();
        res.json({ success: true, data: lowStock });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
