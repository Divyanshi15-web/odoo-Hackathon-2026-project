import { Router } from 'express';
import { getDashboardStats, getDashboardTrends } from '../controllers/dashboard';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/stats', requireAuth, getDashboardStats);
router.get('/trends', requireAuth, getDashboardTrends);

export default router;
