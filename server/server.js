import express from 'express';
import cors from 'cors';
import { initDatabase } from '../database/db.js';

import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import suppliersRouter from './routes/suppliers.js';
import salesRouter from './routes/sales.js';
import analyticsRouter from './routes/analytics.js';
import sqlRunnerRouter from './routes/sql_runner.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database (Schema & Seeds)
initDatabase();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api', productsRouter);
app.use('/api', customersRouter);
app.use('/api', suppliersRouter);
app.use('/api', salesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/sql', sqlRunnerRouter);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), system: 'SmartBiz DBMS Server' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SmartBiz Backend API running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
});
