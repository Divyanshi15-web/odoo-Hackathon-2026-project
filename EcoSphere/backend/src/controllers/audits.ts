import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAudits = async (req: Request, res: Response): Promise<any> => {
  try {
    const audits = await prisma.audit.findMany({
      include: {
        issues: true,
        auditor: { select: { firstName: true, lastName: true } }
      },
      orderBy: { auditDate: 'desc' }
    });
    res.status(200).json(audits);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAudit = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, summary, observations, auditDate } = req.body;
    const auditorId = (req as any).user.userId;

    const audit = await prisma.audit.create({
      data: {
        title,
        summary,
        observations,
        auditDate: new Date(auditDate),
        auditorId,
        status: 'PLANNED'
      }
    });

    res.status(201).json(audit);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAuditStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { auditId } = req.params;
    const { status, observations } = req.body;

    const audit = await prisma.audit.update({
      where: { id: auditId as string },
      data: { 
        status,
        ...(observations ? { observations } : {})
      }
    });

    res.status(200).json(audit);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
