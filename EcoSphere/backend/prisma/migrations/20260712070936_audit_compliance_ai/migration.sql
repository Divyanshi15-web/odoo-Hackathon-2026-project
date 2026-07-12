-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "observations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "auditDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Audit_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Audit" ("auditDate", "auditorId", "createdAt", "id", "summary", "title", "updatedAt") SELECT "auditDate", "auditorId", "createdAt", "id", "summary", "title", "updatedAt" FROM "Audit";
DROP TABLE "Audit";
ALTER TABLE "new_Audit" RENAME TO "Audit";
CREATE TABLE "new_ComplianceIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "ownerId" TEXT,
    "dueDate" DATETIME,
    "isEscalated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComplianceIssue_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ComplianceIssue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ComplianceIssue" ("auditId", "createdAt", "description", "id", "severity", "status", "updatedAt") SELECT "auditId", "createdAt", "description", "id", "severity", "status", "updatedAt" FROM "ComplianceIssue";
DROP TABLE "ComplianceIssue";
ALTER TABLE "new_ComplianceIssue" RENAME TO "ComplianceIssue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
