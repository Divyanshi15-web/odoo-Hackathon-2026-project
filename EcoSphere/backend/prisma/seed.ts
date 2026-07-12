import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('Cleaning existing database records in reverse dependency order...');
  
  // Delete in correct order to respect foreign key constraints
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.complianceIssue.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.employeeBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.cSRActivityParticipation.deleteMany();
  await prisma.cSRActivity.deleteMany();
  await prisma.environmentalGoal.deleteMany();
  await prisma.carbonTransaction.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Database cleanup completed.');
}

async function main() {
  await cleanDatabase();

  console.log('Starting seed process...');

  // 1. Password hashing (pre-hashed to speed up database seeding)
  console.log('Hashing passwords...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Departments
  console.log('Seeding departments...');
  const departmentsData = [
    { name: 'Engineering', description: 'Product development and technical innovation' },
    { name: 'Human Resources', description: 'Talent acquisition, culture, and employee welfare' },
    { name: 'Finance', description: 'Financial planning, accounting, and sustainability investments' },
    { name: 'Operations', description: 'Day-to-day facilities management and logistical efficiency' },
    { name: 'Marketing', description: 'Brand promotion, communications, and public relations' },
    { name: 'Legal & Compliance', description: 'Regulatory alignment, policies, and risk management' },
  ];

  const departments: Record<string, string> = {};
  for (const dept of departmentsData) {
    const createdDept = await prisma.department.create({
      data: dept,
    });
    departments[createdDept.name] = createdDept.id;
  }
  console.log(`Seeded ${Object.keys(departments).length} departments.`);

  // 3. Users & Employees
  console.log('Seeding users and employees...');
  const usersData = [
    // Admin
    { email: 'admin@ecosphere.com', firstName: 'Sarah', lastName: 'Connor', role: 'ADMIN', dept: 'Operations', designation: 'EcoSphere Administrator', xp: 50 },
    // Auditors
    { email: 'auditor1@ecosphere.com', firstName: 'Robert', lastName: 'Patrick', role: 'AUDITOR' },
    { email: 'auditor2@ecosphere.com', firstName: 'Linda', lastName: 'Hamilton', role: 'AUDITOR' },
    // Employees (17 records)
    { email: 'john.doe@ecosphere.com', firstName: 'John', lastName: 'Doe', role: 'EMPLOYEE', dept: 'Engineering', designation: 'Senior Software Engineer', xp: 450 },
    { email: 'jane.smith@ecosphere.com', firstName: 'Jane', lastName: 'Smith', role: 'EMPLOYEE', dept: 'Engineering', designation: 'Frontend Developer', xp: 320 },
    { email: 'david.miller@ecosphere.com', firstName: 'David', lastName: 'Miller', role: 'EMPLOYEE', dept: 'Engineering', designation: 'DevOps Engineer', xp: 510 },
    { email: 'emily.davis@ecosphere.com', firstName: 'Emily', lastName: 'Davis', role: 'EMPLOYEE', dept: 'Human Resources', designation: 'HR Director', xp: 210 },
    { email: 'michael.wilson@ecosphere.com', firstName: 'Michael', lastName: 'Wilson', role: 'EMPLOYEE', dept: 'Human Resources', designation: 'Talent Partner', xp: 150 },
    { email: 'jessica.taylor@ecosphere.com', firstName: 'Jessica', lastName: 'Taylor', role: 'EMPLOYEE', dept: 'Finance', designation: 'Chief Financial Officer', xp: 620 },
    { email: 'james.anderson@ecosphere.com', firstName: 'James', lastName: 'Anderson', role: 'EMPLOYEE', dept: 'Finance', designation: 'Sustainability Accountant', xp: 480 },
    { email: 'robert.thomas@ecosphere.com', firstName: 'Robert', lastName: 'Thomas', role: 'EMPLOYEE', dept: 'Operations', designation: 'Facilities Manager', xp: 750 },
    { email: 'patricia.jackson@ecosphere.com', firstName: 'Patricia', lastName: 'Jackson', role: 'EMPLOYEE', dept: 'Operations', designation: 'Logistics Coordinator', xp: 300 },
    { email: 'charles.white@ecosphere.com', firstName: 'Charles', lastName: 'White', role: 'EMPLOYEE', dept: 'Marketing', designation: 'Marketing Lead', xp: 180 },
    { email: 'barbara.harris@ecosphere.com', firstName: 'Barbara', lastName: 'Harris', role: 'EMPLOYEE', dept: 'Marketing', designation: 'Social Media Specialist', xp: 250 },
    { email: 'joseph.martin@ecosphere.com', firstName: 'Joseph', lastName: 'Martin', role: 'EMPLOYEE', dept: 'Legal & Compliance', designation: 'General Counsel', xp: 400 },
    { email: 'susan.thompson@ecosphere.com', firstName: 'Susan', lastName: 'Thompson', role: 'EMPLOYEE', dept: 'Legal & Compliance', designation: 'Compliance Officer', xp: 520 },
    { email: 'daniel.garcia@ecosphere.com', firstName: 'Daniel', lastName: 'Garcia', role: 'EMPLOYEE', dept: 'Engineering', designation: 'QA Engineer', xp: 120 },
    { email: 'lisa.martinez@ecosphere.com', firstName: 'Lisa', lastName: 'Martinez', role: 'EMPLOYEE', dept: 'Operations', designation: 'EHS Specialist', xp: 580 },
    { email: 'matthew.robinson@ecosphere.com', firstName: 'Matthew', lastName: 'Robinson', role: 'EMPLOYEE', dept: 'Finance', designation: 'Risk Analyst', xp: 340 },
    { email: 'nancy.clark@ecosphere.com', firstName: 'Nancy', lastName: 'Clark', role: 'EMPLOYEE', dept: 'Marketing', designation: 'Content Writer', xp: 220 },
  ];

  const employees: any[] = [];
  const users: any[] = [];
  const auditors: any[] = [];

  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
      },
    });
    users.push(user);

    if (u.role === 'AUDITOR') {
      auditors.push(user);
    } else {
      // Create employee record linked to the user
      const deptName = u.dept || 'Engineering';
      const departmentId = departments[deptName];
      
      const employee = await prisma.employee.create({
        data: {
          userId: user.id,
          departmentId: departmentId,
          designation: u.designation || 'Specialist',
          xp: u.xp || 0,
        },
      });
      employees.push(employee);
    }
  }
  console.log(`Seeded ${users.length} users (${employees.length} employees, ${auditors.length} auditors).`);

  // 4. Emission Factors
  console.log('Seeding emission factors...');
  const emissionFactorsData = [
    { source: 'Grid Electricity', category: 'Electricity', unit: 'kWh', co2Equivalent: 0.385 },
    { source: 'Natural Gas', category: 'Manufacturing', unit: 'm3', co2Equivalent: 1.93 },
    { source: 'Fleet Diesel Fuel', category: 'Fleet', unit: 'liters', co2Equivalent: 2.68 },
    { source: 'Fleet Petrol Fuel', category: 'Fleet', unit: 'liters', co2Equivalent: 2.31 },
    { source: 'Long-haul Flight Travel', category: 'Expenses', unit: 'passenger-km', co2Equivalent: 0.15 },
    { source: 'Train/Rail Transport', category: 'Expenses', unit: 'passenger-km', co2Equivalent: 0.04 },
    { source: 'Office Paper usage', category: 'General', unit: 'kg', co2Equivalent: 0.95 },
    { source: 'Water Consumption', category: 'General', unit: 'm3', co2Equivalent: 0.344 },
  ];

  const emissionFactors: any[] = [];
  const factorMap: Record<string, string> = {};
  for (const factor of emissionFactorsData) {
    const createdFactor = await prisma.emissionFactor.create({
      data: factor,
    });
    emissionFactors.push(createdFactor);
    factorMap[createdFactor.source] = createdFactor.id;
  }
  console.log(`Seeded ${emissionFactors.length} emission factors.`);

  // 5. Carbon Transactions
  console.log('Seeding carbon transactions...');
  const carbonTransactionsData = [
    { dept: 'Engineering', source: 'Grid Electricity', amount: 4500, description: 'Server room power consumption Q1' },
    { dept: 'Engineering', source: 'Office Paper usage', amount: 120, description: 'Documentation printing' },
    { dept: 'Human Resources', source: 'Water Consumption', amount: 80, description: 'Office floor water coolers' },
    { dept: 'Human Resources', source: 'Grid Electricity', amount: 1200, description: 'HR department lightning & AC' },
    { dept: 'Finance', source: 'Grid Electricity', amount: 1500, description: 'Finance office power consumption' },
    { dept: 'Finance', source: 'Long-haul Flight Travel', amount: 15000, description: 'Travel for Q2 auditing and reviews' },
    { dept: 'Operations', source: 'Fleet Diesel Fuel', amount: 2500, description: 'Delivery vans diesel fuel refill' },
    { dept: 'Operations', source: 'Fleet Petrol Fuel', amount: 1800, description: 'Company pool cars fuel refill' },
    { dept: 'Operations', source: 'Natural Gas', amount: 6500, description: 'Building heating systems' },
    { dept: 'Operations', source: 'Water Consumption', amount: 450, description: 'Facility maintenance water usage' },
    { dept: 'Marketing', source: 'Grid Electricity', amount: 1100, description: 'Marketing studio power usage' },
    { dept: 'Marketing', source: 'Long-haul Flight Travel', amount: 8500, description: 'Travel for global campaign launch' },
    { dept: 'Legal & Compliance', source: 'Office Paper usage', amount: 350, description: 'Legal contract printouts' },
    { dept: 'Legal & Compliance', source: 'Grid Electricity', amount: 800, description: 'Legal department power' },
    { dept: 'Engineering', source: 'Fleet Petrol Fuel', amount: 400, description: 'On-site technical support travel' },
    { dept: 'Operations', source: 'Grid Electricity', amount: 9800, description: 'Warehouse operations electricity' },
    { dept: 'Finance', source: 'Train/Rail Transport', amount: 3200, description: 'Regional client meetings train travel' },
    { dept: 'Marketing', source: 'Office Paper usage', amount: 180, description: 'Print media prototypes' },
    { dept: 'Human Resources', source: 'Train/Rail Transport', amount: 1100, description: 'Recruitment team commute travel' },
    { dept: 'Engineering', source: 'Grid Electricity', amount: 4800, description: 'Server room power consumption Q2' },
  ];

  for (let i = 0; i < carbonTransactionsData.length; i++) {
    const data = carbonTransactionsData[i];
    const date = new Date();
    date.setDate(date.getDate() - (i * 8)); // Space dates out over the last few months

    await prisma.carbonTransaction.create({
      data: {
        departmentId: departments[data.dept],
        emissionFactorId: factorMap[data.source],
        amount: data.amount,
        date: date,
        description: data.description,
      }
    });
  }
  console.log(`Seeded ${carbonTransactionsData.length} carbon transactions.`);

  // 6. Environmental Goals
  console.log('Seeding environmental goals...');
  const environmentalGoalsData = [
    { dept: 'Engineering', title: 'Virtualize Server Infrastructure', description: 'Migrate legacy physical servers to energy-efficient cloud instances.', targetValue: 30, currentValue: 22, isCompleted: false, daysToDeadline: 90 },
    { dept: 'Engineering', title: 'Implement Smart Power Strips', description: 'Equip all test labs with smart power strips to auto-shutoff idle equipment.', targetValue: 100, currentValue: 100, isCompleted: true, daysToDeadline: -15 },
    { dept: 'Engineering', title: 'Code Optimization for Server Load', description: 'Optimize database queries to reduce CPU usage and host server electricity draw by 10%.', targetValue: 10, currentValue: 4, isCompleted: false, daysToDeadline: 120 },
    { dept: 'Human Resources', title: 'Switch to Eco-Friendly Kitchenware', description: 'Replace all single-use plastic kitchenware in cafeterias with compostable alternatives.', targetValue: 100, currentValue: 90, isCompleted: false, daysToDeadline: 30 },
    { dept: 'Human Resources', title: 'Implement Commuter Benefits Program', description: 'Establish transit subsidies to encourage train and bicycle commuting.', targetValue: 50, currentValue: 50, isCompleted: true, daysToDeadline: -5 },
    { dept: 'Human Resources', title: 'Establish Remote-First Fridays', description: 'Adopt a mandatory remote work day on Fridays to cut office heating/cooling by 20%.', targetValue: 20, currentValue: 20, isCompleted: true, daysToDeadline: -30 },
    { dept: 'Finance', title: 'Achieve 100% Green Investment Portfolios', description: 'Divest corporate reserves from fossil-fuel projects and reinvest in certified green bonds.', targetValue: 100, currentValue: 85, isCompleted: false, daysToDeadline: 180 },
    { dept: 'Finance', title: 'Digital Invoice Adoption', description: 'Transition 95% of vendors and clients to digital invoice platforms to minimize paper.', targetValue: 95, currentValue: 92, isCompleted: false, daysToDeadline: 45 },
    { dept: 'Finance', title: 'Offset Q1 Flight Carbon Footprint', description: 'Purchase verified Gold Standard carbon offsets for all business travel flights in Q1.', targetValue: 100, currentValue: 100, isCompleted: true, daysToDeadline: -20 },
    { dept: 'Operations', title: 'Upgrade Warehouse LED Lighting', description: 'Replace all outdated metal halide warehouse lamps with smart energy-efficient LEDs.', targetValue: 250, currentValue: 250, isCompleted: true, daysToDeadline: -10 },
    { dept: 'Operations', title: 'Install Solar Panels on Main Facility Roof', description: 'Generate at least 30% of base facilities electricity through rooftop solar panels.', targetValue: 30, currentValue: 12, isCompleted: false, daysToDeadline: 240 },
    { dept: 'Operations', title: 'Achieve Zero Waste to Landfill', description: 'Partner with regional composting and recycling centers to divert all facility waste.', targetValue: 100, currentValue: 78, isCompleted: false, daysToDeadline: 150 },
    { dept: 'Operations', title: 'Deploy Rainwater Harvesting System', description: 'Collect rainwater to supply facilities landscape irrigation and restroom flush systems.', targetValue: 5000, currentValue: 2100, isCompleted: false, daysToDeadline: 100 },
    { dept: 'Operations', title: 'Transition Corporate Fleet to Electric Vehicles', description: 'Replace 5 gas-powered company pool cars with electric vehicle alternatives.', targetValue: 5, currentValue: 2, isCompleted: false, daysToDeadline: 200 },
    { dept: 'Marketing', title: 'Eliminate Print Marketing Materials', description: 'Switch all promotional materials to digital media formats and QR code campaigns.', targetValue: 100, currentValue: 100, isCompleted: true, daysToDeadline: -40 },
    { dept: 'Marketing', title: 'Host Green Marketing Summit', description: 'Organize a webinar series focusing on ecological awareness and our brand commitments.', targetValue: 3, currentValue: 2, isCompleted: false, daysToDeadline: 60 },
    { dept: 'Legal & Compliance', title: 'Publish Annual Sustainability Report', description: 'Draft and release a transparent audit report detailing our carbon metrics and goals.', targetValue: 1, currentValue: 1, isCompleted: true, daysToDeadline: -2 },
    { dept: 'Legal & Compliance', title: '100% Digital Document Execution', description: 'Mandate digital signatures for all external and internal contracts to minimize printing.', targetValue: 100, currentValue: 99, isCompleted: false, daysToDeadline: 15 },
    { dept: 'Legal & Compliance', title: 'Perform ISO 14001 Environmental Audit', description: 'Conduct a thorough review of environmental practices to achieve ISO standard certification.', targetValue: 1, currentValue: 0, isCompleted: false, daysToDeadline: 135 },
    { dept: 'Engineering', title: 'Reduce Test Infrastructure Idle Time', description: 'Configure automated tear-down scripts for CI/CD test instances after completion.', targetValue: 40, currentValue: 35, isCompleted: false, daysToDeadline: 50 },
  ];

  for (const goal of environmentalGoalsData) {
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + goal.daysToDeadline);

    await prisma.environmentalGoal.create({
      data: {
        title: goal.title,
        description: goal.description,
        departmentId: departments[goal.dept],
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        deadline: deadlineDate,
        isCompleted: goal.isCompleted,
      }
    });
  }
  console.log(`Seeded ${environmentalGoalsData.length} environmental goals.`);

  // 7. CSR Activities
  console.log('Seeding CSR activities...');
  const csrActivitiesData = [
    { title: 'Community Park Tree Planting', description: 'Join us in planting 100 native saplings in the local community park.', category: 'Conservation', location: 'Riverside Community Park', daysOffset: -20 },
    { title: 'Sandy Beach Plastic Cleanup', description: 'Remove plastic bottles, nets, and trash from the coastal shoreline.', category: 'Waste Reduction', location: 'Golden Beach Coastline', daysOffset: -10 },
    { title: 'E-Waste Drop-off Drive', description: 'Safe disposal and recycling of old electronics, laptops, and batteries.', category: 'Recycling', location: 'Main HQ Car Park', daysOffset: -5 },
    { title: 'Urban Rooftop Garden Building', description: 'Volunteering to construct organic garden planters on the shelter rooftop.', category: 'Conservation', location: 'Downtown Shelter Roof', daysOffset: 12 },
    { title: 'Youth Sustainability Seminar', description: 'Deliver interactive presentations on climate science to middle school kids.', category: 'Education', location: 'Central School Auditorium', daysOffset: 25 },
    { title: 'Green Energy Home Inspection', description: 'Help elderly residents check their homes for thermal draft leaks.', category: 'Energy Saving', location: 'Oakridge Neighborhood', daysOffset: -15 },
    { title: 'River Basin Waste Collection', description: 'Kayak-based river cleanup event targeting floating waste.', category: 'Waste Reduction', location: 'Lagoon River Basin', daysOffset: -25 },
    { title: 'Composting Masterclass', description: 'Educating employees and locals on back-yard soil composting methods.', category: 'Education', location: 'HQ Cafeteria', daysOffset: 5 },
    { title: 'Corporate Clothes Swap Meet', description: 'Exchange unused fashion garments to reduce textile waste footprint.', category: 'Recycling', location: 'HQ Lobby', daysOffset: -8 },
    { title: 'Community Food Kitchen Support', description: 'Help prepare meals using surplus grocery ingredients.', category: 'Community Outreach', location: 'St. Vincent Soup Kitchen', daysOffset: -12 },
    { title: 'Eco-Brick Constructing Workshop', description: 'Making structural eco-bricks using compressed plastic waste.', category: 'Recycling', location: 'Creative Space Area', daysOffset: 18 },
    { title: 'Local Wildlife Habitat Restoration', description: 'Rebuilding bird nesting boxes and clearing invasive weed species.', category: 'Conservation', location: 'Wetlands Nature Reserve', daysOffset: 30 },
    { title: 'Smart Energy Office Workshop', description: 'Tips and tricks to reduce energy consumption at home and office.', category: 'Energy Saving', location: 'Conference Hall A', daysOffset: 2 },
    { title: 'Bike-To-Work Campaign Kickoff', description: 'Providing free bicycle tune-ups and maps to encourage bike commuting.', category: 'Community Outreach', location: 'HQ Bike Shed', daysOffset: -3 },
    { title: 'Solar Lantern Assembly Session', description: 'Assemble solar-powered lights for delivery to grid-deprived schools.', category: 'Energy Saving', location: 'Engineering Lab B', daysOffset: 8 },
    { title: 'Forest Fire Buffer Clearing', description: 'Clear dry brushwood undergrowth to create fire break pathways.', category: 'Conservation', location: 'Pine Ridge Forest', daysOffset: 45 },
    { title: 'Sustainable Sourcing Panel', description: 'Panel discussion featuring eco-conscious vendors and suppliers.', category: 'Education', location: 'Online Webinar', daysOffset: -30 },
    { title: 'Office Supply Donation Drive', description: 'Collect unused stationery items for donation to local charities.', category: 'Community Outreach', location: 'Reception Desk', daysOffset: -18 },
    { title: 'Wetlands Plastic Trawl', description: 'Retrieve debris and trash from fragile marshlands ecosystems.', category: 'Waste Reduction', location: 'Marshlands Sanctuary', daysOffset: 15 },
    { title: 'Green Roof Planting Volunteer Day', description: 'Planting sedum and moss varieties on our new facility green roof.', category: 'Conservation', location: 'New Warehouse Facility Rooftop', daysOffset: 20 },
  ];

  const csrActivities: any[] = [];
  for (const act of csrActivitiesData) {
    const actDate = new Date();
    actDate.setDate(actDate.getDate() + act.daysOffset);

    const createdAct = await prisma.cSRActivity.create({
      data: {
        title: act.title,
        description: act.description,
        category: act.category,
        date: actDate,
        location: act.location,
      }
    });
    csrActivities.push(createdAct);
  }
  console.log(`Seeded ${csrActivities.length} CSR activities.`);

  // 8. CSR Activity Participations (~30 records)
  console.log('Seeding CSR activity participations...');
  const csrParticipationsCreated = new Set<string>();
  let csrCount = 0;
  while (csrCount < 30) {
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    const randomActivity = csrActivities[Math.floor(Math.random() * csrActivities.length)];
    const key = `${randomEmployee.id}-${randomActivity.id}`;

    if (!csrParticipationsCreated.has(key)) {
      csrParticipationsCreated.add(key);

      const isPast = randomActivity.date < new Date();
      const status = isPast 
        ? (Math.random() > 0.15 ? 'APPROVED' : 'REJECTED') 
        : 'PENDING';

      await prisma.cSRActivityParticipation.create({
        data: {
          employeeId: randomEmployee.id,
          activityId: randomActivity.id,
          hoursContributed: parseFloat((Math.random() * 6 + 1).toFixed(1)),
          status: status,
          evidenceUrl: status === 'APPROVED' ? `https://evidence-storage.ecosphere.com/csr/proof_${csrCount}.jpg` : null,
        }
      });
      csrCount++;
    }
  }
  console.log(`Seeded ${csrCount} CSR activity participation records.`);

  // 9. Challenges
  console.log('Seeding challenges...');
  const challengesData = [
    { title: 'Go Vegetarian for a Week', description: 'Eat plant-based meals only for 7 consecutive days to cut carbon footprints.', difficulty: 'MEDIUM', daysOffsetStart: -15, daysOffsetEnd: -8, points: 150 },
    { title: 'Single-Use Plastic Ban Challenge', description: 'Avoid buying or using single-use plastic bottles, bags, or cutlery.', difficulty: 'HARD', daysOffsetStart: -10, daysOffsetEnd: 0, points: 250 },
    { title: 'Bicycle Commuter Week', description: 'Commute to work using a bicycle for at least 3 days this week.', difficulty: 'MEDIUM', daysOffsetStart: -5, daysOffsetEnd: 2, points: 180 },
    { title: 'Master Shutdown Challenge', description: 'Completely power down your computer, monitor, and desk equipment every night.', difficulty: 'EASY', daysOffsetStart: -2, daysOffsetEnd: 5, points: 80 },
    { title: 'Paperless Workweek', description: 'Perform all work without printing a single page. Use digital tools.', difficulty: 'EASY', daysOffsetStart: 1, daysOffsetEnd: 8, points: 100 },
    { title: 'Zero Waste Lunch Challenge', description: 'Bring lunch to work in reusable containers without any disposable wrappers.', difficulty: 'MEDIUM', daysOffsetStart: 3, daysOffsetEnd: 10, points: 120 },
    { title: 'Cold Shower Eco Challenge', description: 'Take short, lukewarm or cold showers to conserve heating energy.', difficulty: 'HARD', daysOffsetStart: 5, daysOffsetEnd: 12, points: 200 },
    { title: 'Stairs-Only Challenge', description: 'Avoid using elevators and escalators. Opt for the stairs all week.', difficulty: 'EASY', daysOffsetStart: -25, daysOffsetEnd: -18, points: 90 },
    { title: 'Water Saver Challenge', description: 'Turn off the tap while brushing teeth and limit showers to under 5 minutes.', difficulty: 'EASY', daysOffsetStart: -20, daysOffsetEnd: -13, points: 80 },
    { title: 'Lights Out Friday', description: 'Ensure all home and office lights are turned off early in the evening.', difficulty: 'EASY', daysOffsetStart: -12, daysOffsetEnd: -11, points: 50 },
    { title: 'Public Transport Advocate', description: 'Use buses, trains, or subways instead of personal vehicles for a week.', difficulty: 'MEDIUM', daysOffsetStart: 10, daysOffsetEnd: 17, points: 150 },
    { title: 'Carpooling Initiative', description: 'Organize carpool commutes with at least two other colleagues.', difficulty: 'MEDIUM', daysOffsetStart: 15, daysOffsetEnd: 22, points: 140 },
    { title: 'Eco-Shopping Drive', description: 'Shop with reusable cloth bags and buy local organic produce.', difficulty: 'EASY', daysOffsetStart: -30, daysOffsetEnd: -23, points: 70 },
    { title: 'Fast Fashion Detox', description: 'Avoid buying new clothes or accessories for a full month.', difficulty: 'HARD', daysOffsetStart: -28, daysOffsetEnd: 2, points: 300 },
    { title: 'No Screen Sunday', description: 'Power down all personal digital screens for an entire Sunday.', difficulty: 'MEDIUM', daysOffsetStart: 8, daysOffsetEnd: 9, points: 110 },
    { title: 'Thermostat Adjustment Week', description: 'Lower heating by 2°C or raise AC by 2°C to conserve utility power.', difficulty: 'MEDIUM', daysOffsetStart: 12, daysOffsetEnd: 19, points: 130 },
    { title: 'Green Space Gardening', description: 'Spend at least 3 hours gardening, planting, or tending to flora.', difficulty: 'EASY', daysOffsetStart: 20, daysOffsetEnd: 27, points: 90 },
    { title: 'E-Waste Recovery Challenge', description: 'Find 3 old electronic items in your house and drop them off for recycling.', difficulty: 'MEDIUM', daysOffsetStart: 22, daysOffsetEnd: 29, points: 120 },
    { title: 'Eco-Book Reading', description: 'Read a book, essay, or documentary on environmental science.', difficulty: 'EASY', daysOffsetStart: -35, daysOffsetEnd: -28, points: 80 },
    { title: 'Zero Food Waste Challenge', description: 'Buy only what you need and consume all leftovers to prevent waste.', difficulty: 'MEDIUM', daysOffsetStart: -8, daysOffsetEnd: -1, points: 160 },
  ];

  const challenges: any[] = [];
  for (const ch of challengesData) {
    const sDate = new Date();
    sDate.setDate(sDate.getDate() + ch.daysOffsetStart);
    const eDate = new Date();
    eDate.setDate(eDate.getDate() + ch.daysOffsetEnd);

    const createdChallenge = await prisma.challenge.create({
      data: {
        title: ch.title,
        description: ch.description,
        difficulty: ch.difficulty,
        startDate: sDate,
        endDate: eDate,
        points: ch.points,
      }
    });
    challenges.push(createdChallenge);
  }
  console.log(`Seeded ${challenges.length} challenges.`);

  // 10. Challenge Participations (~35 records)
  console.log('Seeding challenge participations...');
  const challengeParticipationsCreated = new Set<string>();
  let challengeCount = 0;
  while (challengeCount < 35) {
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    const key = `${randomEmployee.id}-${randomChallenge.id}`;

    if (!challengeParticipationsCreated.has(key)) {
      challengeParticipationsCreated.add(key);

      const isCompletedChallenge = randomChallenge.endDate < new Date();
      let status = 'ENROLLED';
      if (isCompletedChallenge) {
        status = Math.random() > 0.2 ? 'COMPLETED' : 'FAILED';
      } else {
        status = Math.random() > 0.3 ? 'ENROLLED' : 'COMPLETED';
      }

      await prisma.challengeParticipation.create({
        data: {
          employeeId: randomEmployee.id,
          challengeId: randomChallenge.id,
          status: status,
        }
      });
      challengeCount++;
    }
  }
  console.log(`Seeded ${challengeCount} challenge participation records.`);

  // 11. Badges
  console.log('Seeding badges...');
  const badgesData = [
    { name: 'Eco Warrior', description: 'Awarded for completing 5 sustainability challenges.', iconUrl: 'https://cdn.ecosphere.com/badges/eco_warrior.png' },
    { name: 'Carbon Neutralizer', description: 'Given for contributing 20+ hours to waste and carbon CSR activities.', iconUrl: 'https://cdn.ecosphere.com/badges/carbon_neutral.png' },
    { name: 'Tree Planter Extraordinaire', description: 'Completed a tree planting CSR activity and recorded evidence.', iconUrl: 'https://cdn.ecosphere.com/badges/tree_planter.png' },
    { name: 'Power Saver', description: 'Shut down all office equipment properly for 10 straight workdays.', iconUrl: 'https://cdn.ecosphere.com/badges/power_saver.png' },
    { name: 'Policy Champ', description: 'Acknowledged all core corporate sustainability guidelines within 48 hours.', iconUrl: 'https://cdn.ecosphere.com/badges/policy_champ.png' },
    { name: 'Compliance Guardian', description: 'Owned and successfully resolved a major internal compliance issue.', iconUrl: 'https://cdn.ecosphere.com/badges/compliance_guardian.png' },
  ];

  const badges: any[] = [];
  for (const b of badgesData) {
    const createdBadge = await prisma.badge.create({
      data: b,
    });
    badges.push(createdBadge);
  }
  console.log(`Seeded ${badges.length} badges.`);

  // 12. Employee Badges (~15 records)
  console.log('Awarding badges to employees...');
  const employeeBadgesCreated = new Set<string>();
  let badgeAwardCount = 0;
  while (badgeAwardCount < 15) {
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    const randomBadge = badges[Math.floor(Math.random() * badges.length)];
    const key = `${randomEmployee.id}-${randomBadge.id}`;

    if (!employeeBadgesCreated.has(key)) {
      employeeBadgesCreated.add(key);

      const awardDate = new Date();
      awardDate.setDate(awardDate.getDate() - Math.floor(Math.random() * 30));

      await prisma.employeeBadge.create({
        data: {
          employeeId: randomEmployee.id,
          badgeId: randomBadge.id,
          awardedAt: awardDate,
        }
      });
      badgeAwardCount++;
    }
  }
  console.log(`Seeded ${badgeAwardCount} badge awards.`);

  // 13. Rewards
  console.log('Seeding rewards...');
  const rewardsData = [
    { title: 'Stainless Steel Water Bottle', description: 'Eco-friendly insulated flask with laser-engraved EcoSphere logo.', pointsRequired: 150, inventory: 45 },
    { title: 'Bamboo Cutlery Travel Pack', description: 'Reusable fork, spoon, knife, and metal straw in a canvas roll-up bag.', pointsRequired: 100, inventory: 30 },
    { title: 'Solar Powered Phone Charger', description: 'High efficiency solar cell charger panel with built-in power bank.', pointsRequired: 400, inventory: 15 },
    { title: 'Organic Cotton Shopping Tote', description: 'Heavy-duty reusable grocery tote bag made of certified organic cotton.', pointsRequired: 50, inventory: 100 },
    { title: 'Extra Paid Day Off', description: '1 additional day of paid environmental leave.', pointsRequired: 800, inventory: -1 },
  ];

  const rewards: any[] = [];
  for (const r of rewardsData) {
    const createdReward = await prisma.reward.create({
      data: r,
    });
    rewards.push(createdReward);
  }
  console.log(`Seeded ${rewards.length} rewards.`);

  // 14. Reward Redemptions (~8 records)
  console.log('Seeding reward redemptions...');
  for (let i = 0; i < 8; i++) {
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

    const redeemDate = new Date();
    redeemDate.setDate(redeemDate.getDate() - Math.floor(Math.random() * 15));

    await prisma.rewardRedemption.create({
      data: {
        employeeId: randomEmployee.id,
        rewardId: randomReward.id,
        redeemedAt: redeemDate,
      }
    });
  }
  console.log('Seeded 8 reward redemption logs.');

  // 15. Policies
  console.log('Seeding corporate policies...');
  const policiesData = [
    { title: 'Corporate Environmental Policy v1.1', content: 'Detailed guidelines on waste management, single-use plastic restrictions, energy-conservation routines, and sustainable sourcing expectations for all employees.', version: '1.1', effectiveDate: new Date('2026-01-01') },
    { title: 'Green Travel Directive v2.0', content: 'Incentives for carpooling, instructions for expense reports on public transit and rail, and policy regarding pre-approval requirements for business class flights.', version: '2.0', effectiveDate: new Date('2026-03-15') },
    { title: 'E-Waste & Recycling Protocol v1.0', content: 'Standard operating procedures for discarding hardware, recycling batteries and ink cartridges, and donating legacy office equipment.', version: '1.0', effectiveDate: new Date('2026-05-10') },
  ];

  const policies: any[] = [];
  for (const p of policiesData) {
    const createdPolicy = await prisma.policy.create({
      data: p,
    });
    policies.push(createdPolicy);
  }
  console.log(`Seeded ${policies.length} corporate policies.`);

  // 16. Policy Acknowledgements (~12 records)
  console.log('Seeding policy acknowledgements...');
  const policyAcksCreated = new Set<string>();
  let ackCount = 0;
  while (ackCount < 12) {
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    const randomPolicy = policies[Math.floor(Math.random() * policies.length)];
    const key = `${randomEmployee.id}-${randomPolicy.id}`;

    if (!policyAcksCreated.has(key)) {
      policyAcksCreated.add(key);

      const ackDate = new Date();
      ackDate.setDate(ackDate.getDate() - Math.floor(Math.random() * 20));

      await prisma.policyAcknowledgement.create({
        data: {
          employeeId: randomEmployee.id,
          policyId: randomPolicy.id,
          acknowledgedAt: ackDate,
        }
      });
      ackCount++;
    }
  }
  console.log(`Seeded ${ackCount} policy acknowledgements.`);

  // 17. Audits
  console.log('Seeding audits...');
  const auditsData = [
    { title: 'HQ Energy Conservation Audit', summary: 'Verification of smart thermostat readings, LED upgrades, and solar power integration effectiveness.', observations: 'HVAC systems are working efficiently; however, top floor thermostat overrides were observed during weekends.', status: 'COMPLETED', offsetDays: -45 },
    { title: 'Facility Waste Management Audit', summary: 'Tracking compliance with landfill diversion rate and composting guidelines.', observations: 'Cafeteria staff are segregating organic and recyclable materials correctly. Some shipping materials in packaging area were mixed improperly.', status: 'COMPLETED', offsetDays: -25 },
    { title: 'Supply Chain Carbon Audit', summary: 'Analyzing shipping and supply vendor ecological pledges and reporting standards.', observations: 'Initial assessment shows that 12 of 15 primary vendors have active ESG policies. Remaining 3 need formal followups.', status: 'IN_PROGRESS', offsetDays: -5 },
    { title: 'Q3 Fleet and Transport Audit', summary: 'Checking company car logbooks, fuel transactions, and vehicle emissions logs.', observations: 'Scheduled check to cross-reference fuel receipts and determine EV charging usage rates.', status: 'PLANNED', offsetDays: 15 },
  ];

  const audits: any[] = [];
  for (const a of auditsData) {
    const auditDate = new Date();
    auditDate.setDate(auditDate.getDate() + a.offsetDays);
    const auditor = auditors[Math.floor(Math.random() * auditors.length)];

    const createdAudit = await prisma.audit.create({
      data: {
        title: a.title,
        summary: a.summary,
        observations: a.observations,
        status: a.status,
        auditDate: auditDate,
        auditorId: auditor.id,
      }
    });
    audits.push(createdAudit);
  }
  console.log(`Seeded ${audits.length} audits.`);

  // 18. Compliance Issues (~8 records)
  console.log('Seeding compliance issues...');
  const complianceIssuesData = [
    { auditIdx: 0, description: 'Smart thermostat override logs on top-floor conference rooms during weekends.', severity: 'MEDIUM', status: 'RESOLVED', daysToDue: 15, isEscalated: false },
    { auditIdx: 1, description: 'Incorrect disposal of packaging styrofoam in general cardboard bin.', severity: 'LOW', status: 'RESOLVED', daysToDue: 7, isEscalated: false },
    { auditIdx: 1, description: 'Absence of secondary containment bins for maintenance hydraulic fluids.', severity: 'HIGH', status: 'OPEN', daysToDue: 10, isEscalated: true },
    { auditIdx: 2, description: 'Vendor "TransLogistics Ltd" did not supply their carbon emission logs for Q1.', severity: 'MEDIUM', status: 'OPEN', daysToDue: 30, isEscalated: false },
    { auditIdx: 2, description: 'Supplier packaging contains non-recyclable multi-layered laminate wrappers.', severity: 'LOW', status: 'OPEN', daysToDue: 60, isEscalated: false },
    { auditIdx: 0, description: 'Old server hardware stored in server room corridor instead of being registered for e-waste disposal.', severity: 'MEDIUM', status: 'RESOLVED', daysToDue: 20, isEscalated: false },
    { auditIdx: 1, description: 'Lack of visible composting signage in the second-floor breakroom coffee bar.', severity: 'LOW', status: 'OPEN', daysToDue: 14, isEscalated: false },
    { auditIdx: 2, description: 'Supplier "SteelCraft Inc" failed to provide ISO 14001 certification copy.', severity: 'HIGH', status: 'OPEN', daysToDue: 15, isEscalated: false },
  ];

  for (let i = 0; i < complianceIssuesData.length; i++) {
    const issue = complianceIssuesData[i];
    const targetAudit = audits[issue.auditIdx];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + issue.daysToDue);
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];

    await prisma.complianceIssue.create({
      data: {
        auditId: targetAudit.id,
        description: issue.description,
        severity: issue.severity,
        status: issue.status,
        dueDate: dueDate,
        isEscalated: issue.isEscalated,
        ownerId: randomEmployee.id,
      }
    });
  }
  console.log(`Seeded ${complianceIssuesData.length} compliance issues.`);

  // 19. Notifications (~10 records)
  console.log('Seeding notifications...');
  const notificationMessages = [
    'Welcome to EcoSphere! Get started by setting your sustainability goals.',
    'A new challenge "Paperless Workweek" is now active. Join today and win XP!',
    'Your CSR activity participation for "Sandy Beach Plastic Cleanup" has been approved!',
    'You have been awarded the "Eco Warrior" badge! Keep up the great work.',
    'Audit "HQ Energy Conservation Audit" status has been updated to COMPLETED.',
    'A compliance issue has been assigned to you regarding "Incorrect disposal of packaging styrofoam".',
    'New company environmental policy v1.1 is ready for your review and acknowledgement.',
    'Reminder: "Bicycle Commuter Week" is ending in 2 days. Log your rides.',
    'Reward "Stainless Steel Water Bottle" has been successfully redeemed.',
    'Your teammate has completed the Zero Waste Lunch Challenge!',
  ];

  for (const msg of notificationMessages) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    await prisma.notification.create({
      data: {
        userId: randomUser.id,
        message: msg,
        isRead: Math.random() > 0.4,
      }
    });
  }
  console.log(`Seeded ${notificationMessages.length} user notifications.`);

  // 20. Reports
  console.log('Seeding reports...');
  const reportsData = [
    { title: 'Annual Corporate Carbon Footprint Report 2025', type: 'CARBON', generatedBy: 'Sarah Connor', fileUrl: 'https://reports.ecosphere.com/annual_carbon_2025.pdf' },
    { title: 'Q1 Facility Energy Audit Summary', type: 'ENERGY', generatedBy: 'Robert Patrick', fileUrl: 'https://reports.ecosphere.com/q1_energy_audit.pdf' },
    { title: 'Employee CSR Participation & Volunteer Hours', type: 'CSR', generatedBy: 'Linda Hamilton', fileUrl: 'https://reports.ecosphere.com/csr_volunteer_hours.pdf' },
    { title: 'Supply Chain Sustainability Compliance Overview', type: 'COMPLIANCE', generatedBy: 'Sarah Connor', fileUrl: 'https://reports.ecosphere.com/supply_chain_compliance.pdf' },
  ];

  for (const rep of reportsData) {
    await prisma.report.create({
      data: rep,
    });
  }
  console.log(`Seeded ${reportsData.length} generated reports.`);

  console.log('Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
