-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prospect" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DA_CONTATTARE',
    "potential" TEXT NOT NULL DEFAULT 'MEDIO',
    "websiteStatus" TEXT NOT NULL DEFAULT 'ASSENTE',
    "socialStatus" TEXT NOT NULL DEFAULT 'SCARSO',
    "issues" TEXT,
    "opportunities" TEXT,
    "notes" TEXT,
    "lastContact" DATETIME,
    "nextFollowUp" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Prospect" ("businessName", "category", "city", "createdAt", "email", "id", "instagram", "notes", "ownerName", "phone", "status", "updatedAt", "website") SELECT "businessName", "category", "city", "createdAt", "email", "id", "instagram", "notes", "ownerName", "phone", "status", "updatedAt", "website" FROM "Prospect";
DROP TABLE "Prospect";
ALTER TABLE "new_Prospect" RENAME TO "Prospect";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
