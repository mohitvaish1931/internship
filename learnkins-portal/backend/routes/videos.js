import express from 'express';
import { getVideos, getVideoById, createVideo, updateVideo, deleteVideo } from '../controllers/videoController.js';
import { requireAuth, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All video routes require authentication
router.use(requireAuth);

router.get('/', getVideos);
router.get('/:id', getVideoById);

// Admin-only endpoints
router.post('/upload', adminOnly, upload.single('videoFile'), createVideo);
router.put('/:id', adminOnly, upload.single('videoFile'), updateVideo);
router.delete('/:id', adminOnly, deleteVideo);

export default router;
