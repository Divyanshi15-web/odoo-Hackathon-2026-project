import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const askAssistant = async (req: Request, res: Response): Promise<any> => {
  try {
    const { prompt, contextType } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API Key is not configured in backend.' });
    }

    let systemPrompt = "You are a professional AI ESG Assistant. Help the user with their ESG management queries.";
    let contextData = "";

    if (contextType === 'carbon') {
      systemPrompt = "You are a Carbon Reduction Advisor. Analyze the given carbon data and suggest reduction strategies.";
      const tx = await prisma.carbonTransaction.findMany({ include: { emissionFactor: true }, take: 20 });
      contextData = JSON.stringify(tx);
    } else if (contextType === 'policy') {
      systemPrompt = "You are a Policy Summarizer. Summarize the provided policies clearly for employees.";
      const policies = await prisma.policy.findMany({ take: 5 });
      contextData = JSON.stringify(policies);
    } else if (contextType === 'audit') {
      systemPrompt = "You are an Audit Summarizer. Review these audit observations and compliance issues to highlight risks.";
      const audits = await prisma.audit.findMany({ include: { issues: true }, take: 5 });
      contextData = JSON.stringify(audits);
    }

    const fullPrompt = `${systemPrompt}\n\nContext Data (if any): ${contextData}\n\nUser Prompt: ${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
};

export const generateMonthlyReport = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API Key is not configured.' });
    }

    const [carbon, csr, audits] = await Promise.all([
      prisma.carbonTransaction.aggregate({ _sum: { amount: true } }),
      prisma.cSRActivityParticipation.aggregate({ _sum: { hoursContributed: true } }),
      prisma.audit.count()
    ]);

    const prompt = `
      Act as an Executive ESG Analyst. Write a professional monthly ESG summary report.
      Use this raw data:
      - Total Carbon Emissions: ${carbon._sum.amount || 0} kg CO2e
      - Total CSR Hours Contributed: ${csr._sum.hoursContributed || 0} hours
      - Audits Conducted: ${audits}
      
      Structure the report with an Executive Summary, Carbon Footprint Analysis, Social Impact, and Governance Status.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ report: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
