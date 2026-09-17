import express from 'express';
import db from '../../database/db.js';

const router = express.Router();

// GET all customers
router.get('/customers', (req, res) => {
    try {
        const customers = db.prepare(`
            SELECT c.*,
                   (SELECT COUNT(*) FROM sales_orders so WHERE so.customer_id = c.customer_id) as total_orders,
                   (SELECT COALESCE(SUM(so.net_payable), 0) FROM sales_orders so WHERE so.customer_id = c.customer_id) as lifetime_spent
            FROM customers c
            ORDER BY c.full_name ASC
        `).all();
        res.json({ success: true, data: customers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET customer by ID (with purchase & payment history)
router.get('/customers/:id', (req, res) => {
    try {
        const customer = db.prepare('SELECT * FROM customers WHERE customer_id = ?').get(req.params.id);
        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });

        const orders = db.prepare(`
            SELECT order_id, invoice_number, order_date, net_payable, payment_status
            FROM sales_orders
            WHERE customer_id = ?
            ORDER BY order_date DESC
        `).all(req.params.id);

        const payments = db.prepare(`
            SELECT payment_id, order_id, payment_date, amount, payment_mode, transaction_ref
            FROM payments
            WHERE customer_id = ?
            ORDER BY payment_date DESC
        `).all(req.params.id);

        res.json({ success: true, data: { ...customer, orders, payments } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST new customer
router.post('/customers', (req, res) => {
    const { full_name, phone, email, credit_limit } = req.body;
    try {
        const stmt = db.prepare(`
            INSERT INTO customers (full_name, phone, email, credit_limit)
            VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(full_name, phone, email || null, credit_limit || 5000.00);
        res.status(201).json({ success: true, customer_id: result.lastInsertRowid });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// POST record customer payment / balance settlement
router.post('/customers/:id/pay-balance', (req, res) => {
    const { amount, payment_mode, transaction_ref, received_by } = req.body;
    const customer_id = req.params.id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Payment amount must be greater than 0' });
    }

    try {
        const recordPayment = db.transaction(() => {
            const customer = db.prepare('SELECT outstanding_balance FROM customers WHERE customer_id = ?').get(customer_id);
            if (!customer) throw new Error('Customer not found');

            // 1. Insert Payment entry
            db.prepare(`
                INSERT INTO payments (order_id, customer_id, amount, payment_mode, transaction_ref, received_by)
                VALUES (NULL, ?, ?, ?, ?, ?)
            `).run(customer_id, amount, payment_mode || 'CASH', transaction_ref || 'LEDGER_SETTLEMENT', received_by || 1);

            // 2. Reduce outstanding balance
            const newBalance = Math.max(0, customer.outstanding_balance - amount);
            db.prepare(`
                UPDATE customers
                SET outstanding_balance = ?
                WHERE customer_id = ?
            `).run(newBalance, customer_id);

            return { previous_balance: customer.outstanding_balance, new_balance: newBalance };
        });

        const result = recordPayment();
        res.json({ success: true, message: 'Payment recorded and balance updated', data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
