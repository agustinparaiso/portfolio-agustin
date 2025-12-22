-- Create enums
PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS "Role" (
  "name" TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "SessionStatus" (
  "name" TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "PlanStatus" (
  "name" TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "TemplateKind" (
  "name" TEXT PRIMARY KEY
);

-- Create tables
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INICIADA',
    "responses" JSON NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "computedMetrics" JSON,
    "goal" TEXT,
    "dietType" TEXT,
    "level" TEXT,
    "place" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Plan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "rawResponse" JSON,
    "planJson" JSON,
    "warnings" TEXT,
    "approvedBy" INTEGER,
    "approvedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Plan_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Plan_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "PlanLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "actorId" INTEGER,
    "actorRole" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlanLog_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "helpHtml" TEXT,
    "footerHtml" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "options" JSON,
    "validations" JSON,
    "isSkippable" BOOLEAN NOT NULL DEFAULT false,
    "dependsOn" JSON,
    "uiVariant" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT,
    "level" TEXT,
    "place" TEXT,
    "equipment" TEXT,
    "duration" TEXT,
    "dietType" TEXT,
    "cookTime" TEXT,
    "content" JSON NOT NULL
);

CREATE TABLE "PricingPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "weeks" INTEGER NOT NULL,
    "priceTotal" REAL NOT NULL,
    "pricePerDay" REAL NOT NULL,
    "badge" TEXT,
    "trialDays" INTEGER,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Testimonial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "quote" TEXT NOT NULL,
    "metric" TEXT,
    "avatar" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "useOpenAI" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT,
    "apiKeyEncrypted" TEXT,
    "temperature" REAL,
    "maxTokens" INTEGER,
    "promptSystem" TEXT,
    "promptUser" TEXT,
    "rateLimitPerMin" INTEGER,
    "masterKeyHint" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "_prisma_migrations" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL
);

PRAGMA foreign_keys=ON;
