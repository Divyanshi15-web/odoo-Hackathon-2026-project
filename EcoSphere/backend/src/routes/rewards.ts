import { Router } from 'express';
import { getRewards, createReward, redeemReward, getRedemptionHistory, getBadges } from '../controllers/rewards';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getRewards);
router.post('/', requireAuth, requireRole(['ADMIN']), createReward);
router.post('/:rewardId/redeem', requireAuth, redeemReward);
router.get('/history', requireAuth, getRedemptionHistory);
router.get('/badges', requireAuth, getBadges);

export default router;
