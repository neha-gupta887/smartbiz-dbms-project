-- ========================================================================
-- SmartBiz: Seed Data for Realistic Demonstration
-- ========================================================================

-- 1. Insert Roles
INSERT OR IGNORE INTO roles (role_id, role_name, description) VALUES
(1, 'ADMIN', 'Store Owner / Administrator with full privileges'),
(2, 'CASHIER', 'Front-desk operator for POS Billing and customer handling');

-- 2. Insert Users (Password: admin123 / cashier123)
INSERT OR IGNORE INTO users (user_id, role_id, full_name, username, password_hash, phone) VALUES
(1, 1, 'Rajesh Sharma', 'admin', 'admin123', '9876543201'),
(2, 2, 'Pooja Verma', 'cashier', 'cashier123', '9876543202');

-- 3. Insert Categories
INSERT OR IGNORE INTO categories (category_id, category_name, description) VALUES
(1, 'Electronics & Gadgets', 'Peripherals, cables, adapters, and audio devices'),
(2, 'Stationery & Office', 'Notebooks, pens, desk organizers, printer paper'),
(3, 'Packaged Foods & Snacks', 'Biscuits, chips, soft drinks, chocolates'),
(4, 'Personal Care & Hygiene', 'Soaps, handwashes, sanitizers, dental care');

-- 4. Insert Suppliers
INSERT OR IGNORE INTO suppliers (supplier_id, company_name, contact_person, phone, email, gstin, address) VALUES
(1, 'Apex Tech Distributors', 'Vikram Malhotra', '9811001122', 'sales@apextech.com', '07AAAAA0000A1Z5', 'B-12, Okhla Industrial Area, Phase-II, New Delhi'),
(2, 'National Stationery Mart', 'Sunil Gupta', '9822003344', 'orders@nationalstat.in', '07BBBBB1111B2Z6', 'Shop 44, Nai Sarak, Chandni Chowk, Delhi'),
(3, 'Metro FMCG Wholesale', 'Anil Mehta', '9833005566', 'metro.fmcg@wholesale.com', '07CCCCC2222C3Z7', 'Plot 88, Azadpur Mandi, Delhi');

-- 5. Insert Products
INSERT OR IGNORE INTO products (product_id, category_id, sku_code, product_name, unit, cost_price, selling_price, current_stock, reorder_level) VALUES
(1, 1, 'ELEC-MOU-01', 'Wireless Optical Mouse', 'PCS', 280.00, 499.00, 24, 6),
(2, 1, 'ELEC-KBD-02', 'Mechanical RGB Keyboard', 'PCS', 1450.00, 2299.00, 8, 3),
(3, 1, 'ELEC-CAB-03', 'Braided Type-C Fast Cable (1.2m)', 'PCS', 65.00, 199.00, 3, 10), -- Low Stock!
(4, 1, 'ELEC-AUD-04', 'Bluetooth In-Ear Neckband', 'PCS', 480.00, 899.00, 15, 5),
(5, 2, 'STAT-NOT-01', 'Hardbound Spiral Notebook A4', 'PCS', 70.00, 140.00, 45, 10),
(6, 2, 'STAT-PEN-02', 'Gel Pen Box (Pack of 10)', 'BOX', 90.00, 160.00, 18, 5),
(7, 2, 'STAT-PAP-03', 'A4 Copier Paper Ream (500 Sheets)', 'PCS', 220.00, 340.00, 2, 8), -- Low Stock!
(8, 3, 'FOOD-SNK-01', 'Dark Chocolate Cookies 150g', 'PCS', 35.00, 60.00, 50, 15),
(9, 3, 'FOOD-SNK-02', 'Roasted Almonds 200g Pack', 'PCS', 180.00, 290.00, 12, 5),
(10, 3, 'FOOD-BEV-03', 'Cold Brew Iced Coffee 250ml', 'BTL', 55.00, 110.00, 20, 8),
(11, 4, 'CARE-SOAP-01', 'Organic Tea-Tree Bath Soap 125g', 'PCS', 42.00, 85.00, 30, 10),
(12, 4, 'CARE-SAN-02', 'Alcohol Hand Sanitizer 500ml', 'BTL', 85.00, 175.00, 5, 6); -- Low Stock!

-- 6. Insert Customers
INSERT OR IGNORE INTO customers (customer_id, full_name, phone, email, outstanding_balance, credit_limit) VALUES
(1, 'Aman Deep Singh', '9899112233', 'amandeep@gmail.com', 0.00, 5000.00),
(2, 'Neha Rathi', '9899223344', 'neha.r@outlook.com', 450.00, 8000.00),
(3, 'Innovate Labs Pvt Ltd', '9899334455', 'procurement@innovatelabs.com', 2850.00, 25000.00),
(4, 'Deepak Joshi', '9899445566', 'deepak.j@gmail.com', 0.00, 3000.00);

-- 7. Insert Initial Purchase Orders & Items
INSERT OR IGNORE INTO purchase_orders (purchase_id, supplier_id, user_id, invoice_no, purchase_date, total_amount, status) VALUES
(1, 1, 1, 'APEX-PO-2026-88', datetime('now', '-10 days'), 18200.00, 'RECEIVED'),
(2, 2, 1, 'NAT-BILL-904', datetime('now', '-5 days'), 7800.00, 'RECEIVED');

INSERT OR IGNORE INTO purchase_items (purchase_item_id, purchase_id, product_id, quantity, unit_cost, subtotal) VALUES
(1, 1, 1, 30, 280.00, 8400.00),
(2, 1, 2, 10, 1450.00, 14500.00),
(3, 2, 5, 50, 70.00, 3500.00),
(4, 2, 6, 25, 90.00, 2250.00);

-- 8. Insert Initial Sales Orders & Items
INSERT OR IGNORE INTO sales_orders (order_id, invoice_number, customer_id, cashier_id, order_date, subtotal, tax_amount, discount_amount, net_payable, payment_status) VALUES
(1, 'INV-2026-0001', 1, 2, datetime('now', '-3 days'), 998.00, 49.90, 47.90, 1000.00, 'PAID'),
(2, 'INV-2026-0002', 2, 2, datetime('now', '-2 days'), 2439.00, 121.95, 110.95, 2450.00, 'PARTIAL'),
(3, 'INV-2026-0003', 3, 2, datetime('now', '-1 days'), 3298.00, 164.90, 112.90, 3350.00, 'DUE'),
(4, 'INV-2026-0004', NULL, 2, datetime('now', '-4 hours'), 499.00, 24.95, 23.95, 500.00, 'PAID');

INSERT OR IGNORE INTO sales_items (sales_item_id, order_id, product_id, quantity, unit_price, line_total) VALUES
(1, 1, 1, 2, 499.00, 998.00),
(2, 2, 2, 1, 2299.00, 2299.00),
(3, 2, 5, 1, 140.00, 140.00),
(4, 3, 2, 1, 2299.00, 2299.00),
(5, 3, 4, 1, 899.00, 899.00),
(6, 3, 10, 1, 110.00, 110.00),
(7, 4, 1, 1, 499.00, 499.00);

-- 9. Insert Payments
INSERT OR IGNORE INTO payments (payment_id, order_id, customer_id, payment_date, amount, payment_mode, transaction_ref, received_by) VALUES
(1, 1, 1, datetime('now', '-3 days'), 1000.00, 'UPI', 'UPI/20260911/8472910', 2),
(2, 2, 2, datetime('now', '-2 days'), 2000.00, 'CASH', 'CASH-REC-01', 2),
(3, 3, 3, datetime('now', '-1 days'), 500.00, 'CARD', 'POS-TXN-49120', 2),
(4, 4, NULL, datetime('now', '-4 hours'), 500.00, 'CASH', 'CASH-REC-02', 2);
