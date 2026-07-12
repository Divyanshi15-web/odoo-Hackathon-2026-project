import { Router } from 'express';
import { getIssues, createIssue, updateIssue } from '../controllers/compliance';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/issues', requireAuth, getIssues);
router.post('/issues', requireAuth, requireRole(['ADMIN', 'AUDITOR']), createIssue);
router.patch('/issues/:issueId', requireAuth, updateIssue); // Owners can update status

export default router;
