# EcoSphere API Documentation

## Authentication
All endpoints (except `/auth/login` and `/auth/signup`) require a valid JWT passed in the Authorization header:
`Authorization: Bearer <token>`

## Roles
- `EMPLOYEE`: Basic read/write access for personal modules.
- `AUDITOR`: Can view and manage compliance audits.
- `ADMIN`: Full access to all modules and configurations.

---

## Endpoints

### Auth
- `POST /api/auth/signup` - Register a new user.
- `POST /api/auth/login` - Authenticate and receive a JWT.

### Dashboard
- `GET /api/dashboard/stats` - Retrieve high-level ESG scores (Carbon, Social, Governance).

### Carbon Tracker
- `GET /api/carbon/transactions` - Fetch all carbon emission records.
- `POST /api/carbon/transactions` (ADMIN) - Add a new carbon emission record.
- `GET /api/carbon/factors` - List available emission factors.

### CSR Activities
- `GET /api/csr/activities` - Fetch all community activities.
- `POST /api/csr/activities` (ADMIN) - Create a new activity.
- `POST /api/csr/activities/:id/participate` - Register an employee.

### Challenges
- `GET /api/challenges` - Fetch active sustainability challenges.
- `POST /api/challenges/:challengeId/enroll` - Enroll in a challenge.
- `POST /api/challenges/:challengeId/complete` - Complete a challenge to earn XP.
- `GET /api/challenges/leaderboard` - Get the top employees by XP.

### Rewards
- `GET /api/rewards` - List available items in the reward store.
- `POST /api/rewards/:rewardId/redeem` - Deduct XP and redeem an item.
- `GET /api/rewards/history` - User's redemption history.
- `GET /api/rewards/badges` - User's earned badges.

### Governance & Audits
- `GET /api/governance/policies` - List active corporate policies.
- `POST /api/governance/policies/:id/acknowledge` - Sign/acknowledge a policy.
- `GET /api/audits` (AUDITOR/ADMIN) - List audits.
- `PATCH /api/audits/:auditId/status` (AUDITOR/ADMIN) - Update audit status.
- `GET /api/compliance/issues` - List compliance issues.

### Google Gemini AI
- `POST /api/ai/ask` - Send a prompt to the ESG assistant (requires `GEMINI_API_KEY`).
- `POST /api/ai/report` (ADMIN) - Generate an automated Executive ESG report.
