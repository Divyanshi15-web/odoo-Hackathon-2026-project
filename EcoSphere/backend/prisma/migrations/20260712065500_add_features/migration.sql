-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmissionFactor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "unit" TEXT NOT NULL,
    "co2Equivalent" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_EmissionFactor" ("co2Equivalent", "createdAt", "id", "source", "unit", "updatedAt") SELECT "co2Equivalent", "createdAt", "id", "source", "unit", "updatedAt" FROM "EmissionFactor";
DROP TABLE "EmissionFactor";
ALTER TABLE "new_EmissionFactor" RENAME TO "EmissionFactor";
CREATE UNIQUE INDEX "EmissionFactor_source_key" ON "EmissionFactor"("source");
CREATE TABLE "new_CSRActivityParticipation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "hoursContributed" REAL NOT NULL,
    "evidenceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CSRActivityParticipation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CSRActivityParticipation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "CSRActivity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CSRActivityParticipation" ("activityId", "createdAt", "employeeId", "hoursContributed", "id", "updatedAt") SELECT "activityId", "createdAt", "employeeId", "hoursContributed", "id", "updatedAt" FROM "CSRActivityParticipation";
DROP TABLE "CSRActivityParticipation";
ALTER TABLE "new_CSRActivityParticipation" RENAME TO "CSRActivityParticipation";
CREATE UNIQUE INDEX "CSRActivityParticipation_employeeId_activityId_key" ON "CSRActivityParticipation"("employeeId", "activityId");
CREATE TABLE "new_CSRActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CSRActivity" ("createdAt", "date", "description", "id", "location", "title", "updatedAt") SELECT "createdAt", "date", "description", "id", "location", "title", "updatedAt" FROM "CSRActivity";
DROP TABLE "CSRActivity";
ALTER TABLE "new_CSRActivity" RENAME TO "CSRActivity";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
