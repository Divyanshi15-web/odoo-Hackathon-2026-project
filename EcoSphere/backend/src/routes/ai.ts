import { Router } from 'express';
import { askAssistant, generateMonthlyReport } from '../controllers/ai';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/ask', requireAuth, askAssistant);
router.post('/report', requireAuth, generateMonthlyReport);

export default router;
