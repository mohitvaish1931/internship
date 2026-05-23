import express from 'express';
import { getAnnouncements, createAnnouncement } from '../controllers/announcementController.js';
import { requireAuth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAnnouncements);
router.post('/', adminOnly, createAnnouncement);

export default router;
