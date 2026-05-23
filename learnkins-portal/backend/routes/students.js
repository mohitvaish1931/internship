import express from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';
import { requireAuth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All student administration routes require authenticating as an Admin
router.use(requireAuth);
router.use(adminOnly);

router.get('/', getStudents);
router.post('/create', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
