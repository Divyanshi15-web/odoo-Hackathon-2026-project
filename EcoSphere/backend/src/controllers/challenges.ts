import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getChallenges = async (req: Request, res: Response): Promise<any> => {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        participations: true
      },
      orderBy: { endDate: 'asc' }
    });
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChallenge = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, difficulty, startDate, endDate, points } = req.body;
    
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        difficulty,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        points: parseInt(points, 10)
      }
    });

    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const enrollChallenge = async (req: Request, res: Response): Promise<any> => {
  try {
    const { challengeId } = req.params;
    const userId = (req as any).user.userId;

    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const participation = await prisma.challengeParticipation.create({
      data: {
        employeeId: employee.id,
        challengeId: challengeId as string,
        status: 'ENROLLED'
      }
    });

    res.status(201).json(participation);
  } catch (error) {
    res.status(500).json({ error: 'Error enrolling in challenge' });
  }
};

export const completeChallenge = async (req: Request, res: Response): Promise<any> => {
  try {
    const { challengeId } = req.params;
    const userId = (req as any).user.userId;

    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId as string } });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // Update status
    const participation = await prisma.challengeParticipation.update({
      where: {
        employeeId_challengeId: {
          employeeId: employee.id,
          challengeId: challengeId as string
        }
      },
      data: { status: 'COMPLETED' }
    });

    // Award XP
    await prisma.employee.update({
      where: { id: employee.id },
      data: { xp: { increment: challenge.points } }
    });

    res.status(200).json(participation);
  } catch (error) {
    res.status(500).json({ error: 'Error completing challenge' });
  }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<any> => {
  try {
    const leaderboard = await prisma.employee.findMany({
      include: { user: true },
      orderBy: { xp: 'desc' },
      take: 10
    });
    
    const formatted = leaderboard.map(emp => ({
      id: emp.id,
      name: `${emp.user.firstName} ${emp.user.lastName}`,
      xp: emp.xp
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
