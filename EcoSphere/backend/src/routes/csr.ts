import { Router } from 'express';
import { getActivities, createActivity, registerForActivity, approveParticipation } from '../controllers/csr';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getActivities);
router.post('/', requireAuth, requireRole(['ADMIN']), createActivity);
router.post('/register', requireAuth, registerForActivity);
router.patch('/participations/:participationId/approve', requireAuth, requireRole(['ADMIN']), approveParticipation);

export default router;
