import { Router } from 'express';
import { getChallenges, createChallenge, enrollChallenge, completeChallenge, getLeaderboard } from '../controllers/challenges';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getChallenges);
router.post('/', requireAuth, requireRole(['ADMIN']), createChallenge);
router.post('/:challengeId/enroll', requireAuth, enrollChallenge);
router.post('/:challengeId/complete', requireAuth, completeChallenge);
router.get('/leaderboard', requireAuth, getLeaderboard);

export default router;
