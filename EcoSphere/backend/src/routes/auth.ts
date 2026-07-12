import { Router } from 'express';
import { signup, login, refresh, getProfile, forgotPassword, resetPassword } from '../controllers/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', requireAuth, getProfile);

export default router;
