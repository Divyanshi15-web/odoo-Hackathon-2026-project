import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'EcoSphere API is running' });
});

import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import carbonRoutes from './routes/carbon';
import csrRoutes from './routes/csr';
import challengesRoutes from './routes/challenges';
import rewardsRoutes from './routes/rewards';
import governanceRoutes from './routes/governance';
import auditsRoutes from './routes/audits';
import complianceRoutes from './routes/compliance';
import aiRoutes from './routes/ai';

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/csr', csrRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/audits', auditsRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/ai', aiRoutes);

export default app;
