import express from 'express';
import { getBatches, createBatch, updateBatch, deleteBatch } from '../controllers/batchController.js';
import { requireAuth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/', getBatches);
router.post('/', adminOnly, createBatch);
router.put('/:id', adminOnly, updateBatch);
router.delete('/:id', adminOnly, deleteBatch);

export default router;
