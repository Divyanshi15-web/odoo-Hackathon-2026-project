import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPolicies = async (req: Request, res: Response): Promise<any> => {
  try {
    const policies = await prisma.policy.findMany({
      orderBy: { effectiveDate: 'desc' },
      include: { acknowledgements: true }
    });
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPolicy = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, version, effectiveDate } = req.body;
    
    const policy = await prisma.policy.create({
      data: {
        title,
        content,
        version,
        effectiveDate: new Date(effectiveDate)
      }
    });

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acknowledgePolicy = async (req: Request, res: Response): Promise<any> => {
  try {
    const { policyId } = req.params;
    const userId = (req as any).user.userId;

    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const ack = await prisma.policyAcknowledgement.create({
      data: {
        employeeId: employee.id,
        policyId: policyId as string
      }
    });

    res.status(201).json(ack);
  } catch (error) {
    // If unique constraint fails (already acknowledged), just return success
    if ((error as any).code === 'P2002') {
      return res.status(200).json({ message: 'Already acknowledged' });
    }
    res.status(500).json({ error: 'Error acknowledging policy' });
  }
};

export const getComplianceDashboard = async (req: Request, res: Response): Promise<any> => {
  try {
    const totalEmployees = await prisma.employee.count();
    const policies = await prisma.policy.findMany({
      include: {
        _count: {
          select: { acknowledgements: true }
        }
      }
    });

    const metrics = policies.map(p => ({
      id: p.id,
      title: p.title,
      version: p.version,
      complianceRate: totalEmployees > 0 ? (p._count.acknowledgements / totalEmployees) * 100 : 100
    }));

    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
