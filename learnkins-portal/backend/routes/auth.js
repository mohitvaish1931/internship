import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.post('/login', login);

// Protected Routes
router.get('/me', requireAuth, getMe);

export default router;
