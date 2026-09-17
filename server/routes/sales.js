import express from 'express';
import db from '../../database/db.js';

const router = express.Router();

// GET all sales orders
router.get('/orders', (req, res) => {
    try {
        const orders = db.prepare(`
            SELECT so.*,
                   COALESCE(c.full_name, 'Walk-in Customer') as customer_name,
                   c.phone as customer_phone,
                   u.full_name as cashier_name,
                   (SELECT COUNT(*) FROM sales_items si WHERE si.order_id = so.order_id) as total_items_count
            FROM sales_orders so
            LEFT JOIN customers c ON so.customer_id = c.customer_id
            JOIN users u ON so.cashier_id = u.user_id
            ORDER BY so.order_date DESC
        `).all();
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET single order details (with items and payment details for receipt printing)
router.get('/orders/:id', (req, res) => {
    try {
        const order = db.prepare(`
            SELECT so.*,
                   COALESCE(c.full_name, 'Walk-in Customer') as customer_name,
                   c.phone as customer_phone,
                   c.email as customer_email,
                   c.outstanding_balance as customer_balance,
                   u.full_name as cashier_name
            FROM sales_orders so
            LEFT JOIN customers c ON so.customer_id = c.customer_id
            JOIN users u ON so.cashier_id = u.user_id
            WHERE so.order_id = ?
        `).get(req.params.id);

        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        const items = db.prepare(`
            SELECT si.*, p.product_name, p.sku_code, p.unit
            FROM sales_items si
            JOIN products p ON si.product_id = p.product_id
            WHERE si.order_id = ?
        `).all(req.params.id);

        const payments = db.prepare(`
            SELECT * FROM payments WHERE order_id = ?
        `).all(req.params.id);

        res.json({ success: true, data: { ...order, items, payments } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST Create Sales Order (Checkout Transaction with ACID guarantees)
router.post('/orders', (req, res) => {
    const {
        customer_id,
        cashier_id,
        items,
        tax_rate = 0, // e.g. 5% or 0%
        discount_amount = 0,
        payment_mode = 'CASH', // 'CASH', 'UPI', 'CARD', 'CREDIT', 'SPLIT'
        paid_amount = 0,
        transaction_ref = ''
    } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Cart cannot be empty' });
    }

    try {
        const executeCheckout = db.transaction(() => {
            // 1. Stock validation & subtotal computation
            let subtotal = 0;
            const validatedItems = [];

            for (const item of items) {
                const product = db.prepare('SELECT product_id, product_name, selling_price, current_stock FROM products WHERE product_id = ?').get(item.product_id);
                if (!product) throw new Error(`Product ID ${item.product_id} does not exist`);

                if (product.current_stock < item.quantity) {
                    throw new Error(`Insufficient stock for "${product.product_name}". Available: ${product.current_stock}, Requested: ${item.quantity}`);
                }

                const unitPrice = item.unit_price || product.selling_price;
                const lineTotal = unitPrice * item.quantity;
                subtotal += lineTotal;

                validatedItems.push({
                    product_id: product.product_id,
                    quantity: item.quantity,
                    unit_price: unitPrice,
                    line_total: lineTotal
                });
            }

            const taxAmount = (subtotal * Number(tax_rate)) / 100;
            const netPayable = Math.max(0, subtotal + taxAmount - Number(discount_amount));
            const paid = Number(paid_amount);

            // Determine payment status
            let paymentStatus = 'PAID';
            let dueAmount = 0;
            if (payment_mode === 'CREDIT' || paid === 0) {
                paymentStatus = 'DUE';
                dueAmount = netPayable;
            } else if (paid < netPayable) {
                paymentStatus = 'PARTIAL';
                dueAmount = netPayable - paid;
            }

            // If buying on credit or partial payment, customer_id is required
            if (dueAmount > 0) {
                if (!customer_id) {
                    throw new Error('Credit / partial payment requires a registered customer to record ledger balance.');
                }
                const customer = db.prepare('SELECT outstanding_balance, credit_limit, full_name FROM customers WHERE customer_id = ?').get(customer_id);
                if (!customer) throw new Error('Customer not found');

                if (customer.outstanding_balance + dueAmount > customer.credit_limit) {
                    throw new Error(`Credit limit exceeded for ${customer.full_name}. Limit: ₹${customer.credit_limit}, Existing Debt: ₹${customer.outstanding_balance}, New Due: ₹${dueAmount.toFixed(2)}`);
                }
            }

            // 2. Generate unique invoice number: INV-YYYYMMDD-XXXX
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const invoiceNumber = `INV-${dateStr}-${randomCode}`;

            // 3. Insert Sales Order Header
            const orderStmt = db.prepare(`
                INSERT INTO sales_orders (invoice_number, customer_id, cashier_id, subtotal, tax_amount, discount_amount, net_payable, payment_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const orderResult = orderStmt.run(
                invoiceNumber,
                customer_id || null,
                cashier_id || 2,
                subtotal,
                taxAmount,
                discount_amount,
                netPayable,
                paymentStatus
            );
            const orderId = orderResult.lastInsertRowid;

            // 4. Insert Sales Items (Triggers automatically deduct inventory!)
            const itemStmt = db.prepare(`
                INSERT INTO sales_items (order_id, product_id, quantity, unit_price, line_total)
                VALUES (?, ?, ?, ?, ?)
            `);
            for (const vItem of validatedItems) {
                itemStmt.run(orderId, vItem.product_id, vItem.quantity, vItem.unit_price, vItem.line_total);
            }

            // 5. Insert Payment Entry if paid > 0
            if (paid > 0) {
                db.prepare(`
                    INSERT INTO payments (order_id, customer_id, amount, payment_mode, transaction_ref, received_by)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(orderId, customer_id || null, paid, payment_mode, transaction_ref || 'POS_SALE', cashier_id || 2);
            }

            // 6. Update Customer Outstanding Balance if there's due amount
            if (dueAmount > 0 && customer_id) {
                db.prepare(`
                    UPDATE customers
                    SET outstanding_balance = outstanding_balance + ?
                    WHERE customer_id = ?
                `).run(dueAmount, customer_id);
            }

            return {
                order_id: orderId,
                invoice_number: invoiceNumber,
                subtotal,
                tax_amount: taxAmount,
                discount_amount: Number(discount_amount),
                net_payable: netPayable,
                paid_amount: paid,
                due_amount: dueAmount,
                payment_status: paymentStatus
            };
        });

        const invoice = executeCheckout();
        res.status(201).json({ success: true, message: 'Sale completed successfully', data: invoice });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

export default router;
