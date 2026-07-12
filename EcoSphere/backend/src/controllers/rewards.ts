import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRewards = async (req: Request, res: Response): Promise<any> => {
  try {
    const rewards = await prisma.reward.findMany({
      orderBy: { pointsRequired: 'asc' }
    });
    res.status(200).json(rewards);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createReward = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, pointsRequired, inventory } = req.body;
    
    const reward = await prisma.reward.create({
      data: {
        title,
        description,
        pointsRequired: parseInt(pointsRequired, 10),
        inventory: inventory ? parseInt(inventory, 10) : -1
      }
    });

    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const redeemReward = async (req: Request, res: Response): Promise<any> => {
  try {
    const { rewardId } = req.params;
    const userId = (req as any).user.userId;

    const employee = await prisma.employee.findUnique({ where: { userId } });
    const reward = await prisma.reward.findUnique({ where: { id: rewardId as string } });

    if (!employee || !reward) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (reward.inventory === 0) {
      return res.status(400).json({ error: 'Reward out of stock' });
    }

    if (employee.xp < reward.pointsRequired) {
      return res.status(400).json({ error: 'Insufficient XP' });
    }

    // Transaction to ensure atomicity
    await prisma.$transaction([
      // Create redemption history
      prisma.rewardRedemption.create({
        data: {
          employeeId: employee.id,
          rewardId: reward.id
        }
      }),
      // Deduct XP
      prisma.employee.update({
        where: { id: employee.id },
        data: { xp: { decrement: reward.pointsRequired } }
      }),
      // Decrement inventory if not infinite
      ...(reward.inventory > 0 
        ? [prisma.reward.update({
            where: { id: reward.id },
            data: { inventory: { decrement: 1 } }
          })] 
        : [])
    ]);

    res.status(200).json({ message: 'Reward redeemed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error redeeming reward' });
  }
};

export const getRedemptionHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const history = await prisma.rewardRedemption.findMany({
      where: { employeeId: employee.id },
      include: { reward: true },
      orderBy: { redeemedAt: 'desc' }
    });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBadges = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Fetch earned badges
    const earned = await prisma.employeeBadge.findMany({
      where: { employeeId: employee.id },
      include: { badge: true }
    });

    // We can also run an auto-unlock check here for XP threshold badges.
    // For demo purposes, we will return the earned ones.

    res.status(200).json(earned.map(e => e.badge));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
