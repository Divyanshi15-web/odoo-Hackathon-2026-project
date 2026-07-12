import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getIssues = async (req: Request, res: Response): Promise<any> => {
  try {
    const issues = await prisma.complianceIssue.findMany({
      include: {
        audit: { select: { title: true } },
        owner: { select: { user: { select: { firstName: true, lastName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createIssue = async (req: Request, res: Response): Promise<any> => {
  try {
    const { auditId, description, severity, dueDate, ownerId } = req.body;
    
    const issue = await prisma.complianceIssue.create({
      data: {
        auditId,
        description,
        severity,
        dueDate: dueDate ? new Date(dueDate) : null,
        ownerId
      }
    });

    if (ownerId) {
      const emp = await prisma.employee.findUnique({ where: { id: ownerId } });
      if (emp) {
        await prisma.notification.create({
          data: {
            userId: emp.userId,
            message: `You have been assigned a new compliance issue: ${description}`
          }
        });
      }
    }

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateIssue = async (req: Request, res: Response): Promise<any> => {
  try {
    const { issueId } = req.params;
    const { status, isEscalated, ownerId } = req.body;

    const issue = await prisma.complianceIssue.update({
      where: { id: issueId as string },
      data: { 
        ...(status ? { status } : {}),
        ...(isEscalated !== undefined ? { isEscalated } : {}),
        ...(ownerId !== undefined ? { ownerId } : {})
      }
    });

    res.status(200).json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
