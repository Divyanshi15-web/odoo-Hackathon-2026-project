import { Router } from 'express';
import { getPolicies, createPolicy, acknowledgePolicy, getComplianceDashboard } from '../controllers/governance';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/policies', requireAuth, getPolicies);
router.post('/policies', requireAuth, requireRole(['ADMIN']), createPolicy);
router.post('/policies/:policyId/acknowledge', requireAuth, acknowledgePolicy);
router.get('/compliance', requireAuth, requireRole(['ADMIN']), getComplianceDashboard);

export default router;
