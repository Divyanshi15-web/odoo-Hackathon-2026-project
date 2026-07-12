import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getActivities = async (req: Request, res: Response): Promise<any> => {
  try {
    const activities = await prisma.cSRActivity.findMany({
      include: {
        participations: true
      },
      orderBy: { date: 'desc' }
    });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createActivity = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, category, date, location } = req.body;
    
    const activity = await prisma.cSRActivity.create({
      data: {
        title,
        description,
        category,
        date: new Date(date),
        location
      }
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerForActivity = async (req: Request, res: Response): Promise<any> => {
  try {
    const { activityId, hoursContributed, evidenceUrl } = req.body;
    const userId = (req as any).user.userId;

    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const participation = await prisma.cSRActivityParticipation.create({
      data: {
        employeeId: employee.id,
        activityId,
        hoursContributed,
        evidenceUrl,
        status: 'PENDING'
      }
    });

    res.status(201).json(participation);
  } catch (error) {
    res.status(500).json({ error: 'Error registering for activity' });
  }
};

export const approveParticipation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { participationId } = req.params;
    
    // In real app, only ADMIN can do this, middleware handles it
    const participation = await prisma.cSRActivityParticipation.update({
      where: { id: participationId as string },
      data: { status: 'APPROVED' }
    });

    // Here we could also grant XP, generate a certificate entry, etc.

    res.status(200).json(participation);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
