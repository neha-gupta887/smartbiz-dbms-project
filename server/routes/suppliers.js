import express from 'express';
import db from '../../database/db.js';

const router = express.Router();

// GET all suppliers
router.get('/suppliers', (req, res) => {
    try {
        const suppliers = db.prepare(`
            SELECT s.*, 
                   COUNT(po.purchase_id) as total_purchases,
                   COALESCE(SUM(po.total_amount), 0) as total_purchased_value
            FROM suppliers s
            LEFT JOIN purchase_orders po ON s.supplier_id = po.supplier_id
            GROUP BY s.supplier_id
            ORDER BY s.company_name ASC
        `).all();
        res.json({ success: true, data: suppliers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST new supplier
router.post('/suppliers', (req, res) => {
    const { company_name, contact_person, phone, email, gstin, address } = req.body;
    try {
        const stmt = db.prepare(`
            INSERT INTO suppliers (company_name, contact_person, phone, email, gstin, address)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(company_name, contact_person, phone, email, gstin, address);
        res.status(201).json({ success: true, supplier_id: result.lastInsertRowid });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// GET all purchase orders
router.get('/purchases', (req, res) => {
    try {
        const purchases = db.prepare(`
            SELECT po.*, s.company_name as supplier_name, u.full_name as created_by_name
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.supplier_id
            JOIN users u ON po.user_id = u.user_id
            ORDER BY po.purchase_date DESC
        `).all();
        res.json({ success: true, data: purchases });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET single purchase order with line items
router.get('/purchases/:id', (req, res) => {
    try {
        const purchase = db.prepare(`
            SELECT po.*, s.company_name as supplier_name, s.contact_person, s.phone as supplier_phone, s.gstin as supplier_gstin, u.full_name as created_by_name
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.supplier_id
            JOIN users u ON po.user_id = u.user_id
            WHERE po.purchase_id = ?
        `).get(req.params.id);

        if (!purchase) {
            return res.status(404).json({ success: false, error: 'Purchase order not found' });
        }

        const items = db.prepare(`
            SELECT pi.*, p.product_name, p.sku_code, p.unit
            FROM purchase_items pi
            JOIN products p ON pi.product_id = p.product_id
            WHERE pi.purchase_id = ?
        `).all(req.params.id);

        res.json({ success: true, data: { ...purchase, items } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST create inward purchase order (Restock items with database transaction)
router.post('/purchases', (req, res) => {
    const { supplier_id, user_id, invoice_no, items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, error: 'At least one item is required' });
    }

    try {
        const createPurchase = db.transaction(() => {
            // Calculate total
            const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

            // 1. Insert Purchase Order Header
            const poStmt = db.prepare(`
                INSERT INTO purchase_orders (supplier_id, user_id, invoice_no, total_amount, status)
                VALUES (?, ?, ?, ?, 'RECEIVED')
            `);
            const poResult = poStmt.run(supplier_id, user_id || 1, invoice_no || `PO-${Date.now()}`, totalAmount);
            const purchaseId = poResult.lastInsertRowid;

            // 2. Insert items (Triggers automatically update stock!)
            const itemStmt = db.prepare(`
                INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `);

            for (const item of items) {
                const subtotal = item.quantity * item.unit_cost;
                itemStmt.run(purchaseId, item.product_id, item.quantity, item.unit_cost, subtotal);
            }

            return { purchase_id: purchaseId, total_amount: totalAmount };
        });

        const result = createPurchase();
        res.status(201).json({ success: true, message: 'Stock received and inventory updated successfully', data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
