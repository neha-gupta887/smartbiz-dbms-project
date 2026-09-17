import express from 'express';
import db from '../../database/db.js';

const router = express.Router();

// GET all users
router.get('/users', (req, res) => {
    try {
        const users = db.prepare(`
            SELECT u.user_id, u.role_id, r.role_name, u.full_name, u.username, u.phone, u.is_active, u.created_at
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
        `).all();
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const user = db.prepare(`
            SELECT u.user_id, u.role_id, r.role_name, u.full_name, u.username, u.password_hash, u.is_active
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.username = ?
        `).get(username);

        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        if (user.password_hash !== password) {
            return res.status(401).json({ success: false, error: 'Invalid password' });
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, error: 'Account is deactivated' });
        }

        // Return user info (omit password_hash)
        const { password_hash, ...safeUser } = user;
        res.json({ success: true, user: safeUser, message: `Welcome back, ${safeUser.full_name}!` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
