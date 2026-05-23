import express from 'express';
import { getAdminStats, getBatchAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { requireAuth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Admin-only metrics
router.get('/admin', adminOnly, getAdminStats);
router.get('/batch/:id', adminOnly, getBatchAnalytics);

// Joint access: Students can get their own, Admin can get any student's
router.get('/student/:id', getStudentAnalytics);

export default router;
