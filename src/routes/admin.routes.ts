// src/routes/admin.routes.ts
import express from 'express';
import {
  registerAdmin,
  addAdmin,
  removeAdmin,
  loginAdmin,
  getAdmins,
} from '../controllers/admin.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Initial registration route (for setup)
router.post('/register', registerAdmin);

// Admin login route
router.post('/login', loginAdmin);

// Admin management routes
router.post('/add', authenticateAdmin, addAdmin);
router.delete('/remove/:adminId', authenticateAdmin, removeAdmin);

router.get('/all', authenticateAdmin, getAdmins);

export default router;
