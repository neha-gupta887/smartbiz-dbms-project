import express from 'express';
import db from '../../database/db.js';

const router = express.Router();

// GET all categories
router.get('/categories', (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories ORDER BY category_name').all();
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST new category
router.post('/categories', (req, res) => {
    const { category_name, description } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO categories (category_name, description) VALUES (?, ?)');
        const result = stmt.run(category_name, description);
        res.status(201).json({ success: true, category_id: result.lastInsertRowid });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// GET all products (with optional search, category filter, low stock filter)
router.get('/products', (req, res) => {
    const { search, category_id, low_stock } = req.query;
    try {
        let sql = `
            SELECT p.*, c.category_name,
                   (p.selling_price - p.cost_price) as margin,
                   CASE WHEN p.current_stock <= p.reorder_level THEN 1 ELSE 0 END as is_low_stock
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.is_active = 1
        `;
        const params = [];

        if (search) {
            sql += ` AND (p.product_name LIKE ? OR p.sku_code LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category_id) {
            sql += ` AND p.category_id = ?`;
            params.push(category_id);
        }

        if (low_stock === 'true') {
            sql += ` AND p.current_stock <= p.reorder_level`;
        }

        sql += ` ORDER BY p.product_name ASC`;

        const products = db.prepare(sql).all(...params);
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET product by ID
router.get('/products/:id', (req, res) => {
    try {
        const product = db.prepare(`
            SELECT p.*, c.category_name
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id = ?
        `).get(req.params.id);

        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST new product
router.post('/products', (req, res) => {
    const { category_id, sku_code, product_name, unit, cost_price, selling_price, current_stock, reorder_level } = req.body;
    try {
        const stmt = db.prepare(`
            INSERT INTO products (category_id, sku_code, product_name, unit, cost_price, selling_price, current_stock, reorder_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            category_id,
            sku_code.toUpperCase(),
            product_name,
            unit || 'PCS',
            cost_price,
            selling_price,
            current_stock || 0,
            reorder_level || 5
        );
        res.status(201).json({ success: true, product_id: result.lastInsertRowid });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT update product
router.put('/products/:id', (req, res) => {
    const { category_id, sku_code, product_name, unit, cost_price, selling_price, current_stock, reorder_level } = req.body;
    try {
        const stmt = db.prepare(`
            UPDATE products
            SET category_id = ?, sku_code = ?, product_name = ?, unit = ?,
                cost_price = ?, selling_price = ?, current_stock = ?, reorder_level = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ?
        `);
        stmt.run(category_id, sku_code.toUpperCase(), product_name, unit, cost_price, selling_price, current_stock, reorder_level, req.params.id);
        res.json({ success: true, message: 'Product updated successfully' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE product (Soft delete)
router.delete('/products/:id', (req, res) => {
    try {
        db.prepare('UPDATE products SET is_active = 0 WHERE product_id = ?').run(req.params.id);
        res.json({ success: true, message: 'Product deactivated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
