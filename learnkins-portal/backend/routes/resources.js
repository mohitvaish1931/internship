import express from 'express';
import { getResources, createResource, updateResource, deleteResource } from '../controllers/resourceController.js';
import { requireAuth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/', getResources);
router.post('/', adminOnly, createResource);
router.put('/:id', adminOnly, updateResource);
router.delete('/:id', adminOnly, deleteResource);

export default router;
