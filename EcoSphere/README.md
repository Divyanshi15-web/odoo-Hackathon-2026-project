# EcoSphere - AI Powered ESG Management Platform

EcoSphere is a comprehensive, production-ready enterprise application designed to track, manage, and report on Environmental, Social, and Governance (ESG) metrics.

## Key Features
- **Carbon Tracking**: Automatically calculate CO2 equivalents based on department activities (Fleet, Manufacturing, Expenses).
- **CSR & Social Impact**: Track employee volunteer hours and community activities.
- **Sustainability Challenges**: Gamified modules where employees earn XP by completing eco-friendly challenges.
- **Rewards Store**: A fully-functional storefront for employees to redeem earned XP for physical or virtual items.
- **Governance & Audits**: Policy tracking, employee acknowledgements, and an Auditor dashboard for logging compliance issues and escalating risks.
- **Reporting Engine**: One-click exports for ESG Summaries, Carbon, and Audit data in PDF, Excel (.xlsx), and CSV formats.
- **Gemini AI Integration**: An intelligent AI assistant powered by Google Generative AI capable of acting as a Carbon Advisor, Policy Summarizer, and automatically generating Monthly Executive Reports.

## Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Recharts, jsPDF, XLSX.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL (Development mock using SQLite), Prisma ORM.
- **Authentication**: JWT (JSON Web Tokens), Role-Based Access Control (Admin, Auditor, Employee).
- **Infrastructure**: Docker, Docker Compose.

## Getting Started (Local Development)

### Prerequisites
- Node.js (v20+)
- npm

### 1. Backend Setup
```bash
cd backend
npm install
# Set your Gemini API Key in backend/.env for AI features
# GEMINI_API_KEY="your_api_key_here"

# Run Prisma Migrations & Seed the database
npx prisma migrate dev
npm run seed

# Start the dev server
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

### 3. Docker Deployment
To run the entire stack using Docker Compose:
```bash
docker-compose up --build -d
```
The frontend will be exposed on port `80` and the backend on port `3000`.

## Documentation
Please refer to `API_DOCUMENTATION.md` for a comprehensive list of all backend endpoints and payloads.
