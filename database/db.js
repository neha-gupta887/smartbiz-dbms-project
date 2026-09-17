import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'smartbiz.db');
const schemaPath = path.join(__dirname, 'schema.sql');
const seedPath = path.join(__dirname, 'seed_data.sql');

// Initialize native SQLite database
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Helper for transactions
db.transaction = function (fn) {
    return function (...args) {
        db.exec('BEGIN TRANSACTION;');
        try {
            const result = fn(...args);
            db.exec('COMMIT;');
            return result;
        } catch (err) {
            db.exec('ROLLBACK;');
            throw err;
        }
    };
};

export function initDatabase() {
    console.log(`[DB] Initializing database at ${dbPath}...`);

    // Read and execute schema
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
    console.log('[DB] Schema loaded successfully.');

    // Seed initial data if products table is empty
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    if (productCount === 0) {
        console.log('[DB] Seeding initial demonstration data...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        db.exec(seedSql);
        console.log('[DB] Seed data populated.');
    } else {
        console.log(`[DB] Database ready with ${productCount} existing products.`);
    }

    return db;
}

export default db;
