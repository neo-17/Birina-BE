import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/user.controller';

const router = Router();

// Register or retrieve user
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
