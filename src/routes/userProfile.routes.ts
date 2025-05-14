// src/routes/userProfile.routes.ts
import { Router } from 'express';
import {
  getUserProfile,
  revealUserPrivateKey,
} from '../controllers/userProfile.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/users/profile/:username
router.get('/profile/:username', authenticateUser, getUserProfile);

// PUT /api/users/:username/pin
// router.put('/:username/pin', updateUserPin);

// POST /api/users/reveal-key
router.post('/reveal-key', authenticateUser, revealUserPrivateKey);

export default router;
