import express from 'express';
import { getEmailLogs, sendBroadcast } from '../controllers/emailController.js';
import { requireAuth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All email manager endpoints require Admin authentication
router.use(requireAuth);
router.use(adminOnly);

router.get('/logs', getEmailLogs);
router.post('/send', sendBroadcast);

export default router;
