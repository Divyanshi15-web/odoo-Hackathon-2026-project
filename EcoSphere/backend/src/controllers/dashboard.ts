import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    // In a real app, these scores would be computed based on complex logic.
    // Here we'll generate realistic mock scores or aggregate from the DB.
    
    // Total carbon emissions
    const emissions = await prisma.carbonTransaction.aggregate({
      _sum: { amount: true }
    });
    
    // CSR hours
    const csr = await prisma.cSRActivityParticipation.aggregate({
      _sum: { hoursContributed: true }
    });
    
    const carbonTotal = emissions._sum.amount || 0;
    const csrHours = csr._sum.hoursContributed || 0;

    // Calculate arbitrary scores for the dashboard 1-100 scale
    const carbonScore = Math.max(0, 100 - (carbonTotal / 1000));
    const socialScore = Math.min(100, csrHours * 2);
    const governanceScore = 85; // Fixed for now
    
    const overallScore = Math.round((carbonScore + socialScore + governanceScore) / 3);

    // Department rankings based on CSR hours as a proxy for "goodness"
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          include: { participations: true }
        }
      }
    });

    const rankings = departments.map(dept => {
      const hours = dept.employees.reduce((acc, emp) => {
        return acc + emp.participations.reduce((sum, p) => sum + p.hoursContributed, 0);
      }, 0);
      return { id: dept.id, name: dept.name, score: hours };
    }).sort((a, b) => b.score - a.score);

    res.status(200).json({
      overallScore,
      carbonScore,
      socialScore,
      governanceScore,
      rankings
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardTrends = async (req: Request, res: Response): Promise<any> => {
  try {
    // Mock trends for the Recharts
    const trends = [
      { name: 'Jan', emissions: 4000, goals: 2400 },
      { name: 'Feb', emissions: 3000, goals: 1398 },
      { name: 'Mar', emissions: 2000, goals: 9800 },
      { name: 'Apr', emissions: 2780, goals: 3908 },
      { name: 'May', emissions: 1890, goals: 4800 },
      { name: 'Jun', emissions: 2390, goals: 3800 },
      { name: 'Jul', emissions: 3490, goals: 4300 },
    ];
    
    const recentActivities = await prisma.cSRActivity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      trends,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
