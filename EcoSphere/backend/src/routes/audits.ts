import { Router } from 'express';
import { getAudits, createAudit, updateAuditStatus } from '../controllers/audits';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getAudits);
router.post('/', requireAuth, requireRole(['ADMIN', 'AUDITOR']), createAudit);
router.patch('/:auditId/status', requireAuth, requireRole(['ADMIN', 'AUDITOR']), updateAuditStatus);

export default router;
