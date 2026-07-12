import { Router } from 'express';
import { getEmissionFactors, createCarbonTransaction, getCarbonTransactions, getMonthlyReports } from '../controllers/carbon';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/factors', requireAuth, getEmissionFactors);
router.get('/transactions', requireAuth, getCarbonTransactions);
router.post('/transactions', requireAuth, requireRole(['ADMIN', 'EMPLOYEE']), createCarbonTransaction);
router.get('/reports/monthly', requireAuth, getMonthlyReports);

export default router;
