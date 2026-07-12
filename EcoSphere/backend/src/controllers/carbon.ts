import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getEmissionFactors = async (req: Request, res: Response): Promise<any> => {
  try {
    const factors = await prisma.emissionFactor.findMany();
    res.status(200).json(factors);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCarbonTransaction = async (req: Request, res: Response): Promise<any> => {
  try {
    const { departmentId, emissionFactorId, amount, description } = req.body;
    
    const factor = await prisma.emissionFactor.findUnique({ where: { id: emissionFactorId } });
    if (!factor) {
      return res.status(404).json({ error: 'Emission factor not found' });
    }

    // Automatic calculation logic: we store the raw amount, but we also return the calculated value
    const calculatedCarbon = amount * factor.co2Equivalent;

    const transaction = await prisma.carbonTransaction.create({
      data: {
        departmentId,
        emissionFactorId,
        amount,
        description
      },
      include: {
        emissionFactor: true,
        department: true
      }
    });

    res.status(201).json({ transaction, calculatedCarbon });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCarbonTransactions = async (req: Request, res: Response): Promise<any> => {
  try {
    const transactions = await prisma.carbonTransaction.findMany({
      include: {
        emissionFactor: true,
        department: true
      },
      orderBy: { date: 'desc' }
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMonthlyReports = async (req: Request, res: Response): Promise<any> => {
  try {
    // Generate mocked report aggregation for charts
    const reports = [
      { category: 'Electricity', amount: 1500 },
      { category: 'Fleet', amount: 3200 },
      { category: 'Manufacturing', amount: 4800 },
      { category: 'Expenses', amount: 900 }
    ];
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
