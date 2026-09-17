-- ========================================================================
-- SmartBiz: Business Management System Database Schema
-- Standard Relational Schema (MySQL 8.0+ / SQLite / PostgreSQL compatible)
-- ========================================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(150)
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(200)
);

-- 4. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name VARCHAR(120) NOT NULL,
    contact_person VARCHAR(80),
    phone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100),
    gstin VARCHAR(20) UNIQUE,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS TABLE (Inventory)
CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    sku_code VARCHAR(30) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    unit VARCHAR(20) DEFAULT 'PCS',
    cost_price DECIMAL(10,2) NOT NULL CHECK (cost_price >= 0),
    selling_price DECIMAL(10,2) NOT NULL CHECK (selling_price >= cost_price),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 5 CHECK (reorder_level >= 0),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);

-- 6. CUSTOMERS TABLE (With Ledger / Khata balance)
CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100),
    outstanding_balance DECIMAL(10,2) DEFAULT 0.00 CHECK (outstanding_balance >= 0),
    credit_limit DECIMAL(10,2) DEFAULT 5000.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. PURCHASE ORDERS TABLE (Inward restocking from suppliers)
CREATE TABLE IF NOT EXISTS purchase_orders (
    purchase_id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    invoice_no VARCHAR(50),
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) DEFAULT 'RECEIVED',
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 8. PURCHASE ITEMS TABLE (Line items for purchase orders)
CREATE TABLE IF NOT EXISTS purchase_items (
    purchase_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (purchase_id) REFERENCES purchase_orders(purchase_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);

-- 9. SALES ORDERS TABLE (Point of Sale invoices)
CREATE TABLE IF NOT EXISTS sales_orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(40) NOT NULL UNIQUE,
    customer_id INTEGER,
    cashier_id INTEGER NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    net_payable DECIMAL(10,2) NOT NULL CHECK (net_payable >= 0),
    payment_status VARCHAR(20) DEFAULT 'PAID', -- 'PAID', 'PARTIAL', 'DUE'
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (cashier_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 10. SALES ITEMS TABLE (Line items for sales orders)
CREATE TABLE IF NOT EXISTS sales_items (
    sales_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    line_total DECIMAL(10,2) NOT NULL CHECK (line_total >= 0),
    FOREIGN KEY (order_id) REFERENCES sales_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);

-- 11. PAYMENTS TABLE (Payment settlements)
CREATE TABLE IF NOT EXISTS payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    customer_id INTEGER,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(20) NOT NULL, -- 'CASH', 'UPI', 'CARD', 'CREDIT'
    transaction_ref VARCHAR(100),
    received_by INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES sales_orders(order_id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (received_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_items_order ON sales_items(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_items_product ON sales_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);

-- DATABASE VIEWS
CREATE VIEW IF NOT EXISTS view_low_stock_products AS
SELECT 
    p.product_id,
    p.sku_code,
    p.product_name,
    c.category_name,
    p.current_stock,
    p.reorder_level,
    (p.reorder_level - p.current_stock) AS stock_deficit
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.current_stock <= p.reorder_level AND p.is_active = 1;

CREATE VIEW IF NOT EXISTS view_sales_summary AS
SELECT 
    so.order_id,
    so.invoice_number,
    so.order_date,
    COALESCE(c.full_name, 'Walk-in Customer') AS customer_name,
    u.full_name AS cashier_name,
    so.subtotal,
    so.tax_amount,
    so.discount_amount,
    so.net_payable,
    so.payment_status
FROM sales_orders so
LEFT JOIN customers c ON so.customer_id = c.customer_id
JOIN users u ON so.cashier_id = u.user_id;

-- DATABASE TRIGGERS
-- Trigger 1: Automatically reduce stock when a sales item is inserted
CREATE TRIGGER IF NOT EXISTS trg_deduct_stock_after_sale
AFTER INSERT ON sales_items
BEGIN
    UPDATE products
    SET current_stock = current_stock - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;
END;

-- Trigger 2: Automatically increase stock when purchase items are received
CREATE TRIGGER IF NOT EXISTS trg_add_stock_after_purchase
AFTER INSERT ON purchase_items
BEGIN
    UPDATE products
    SET current_stock = current_stock + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;
END;
