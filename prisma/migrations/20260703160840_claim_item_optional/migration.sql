-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT,
    "claimerId" TEXT NOT NULL,
    "plannedGiveDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "reminderStage" INTEGER NOT NULL DEFAULT 0,
    "expiringStartedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Claim_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WishlistItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Claim_claimerId_fkey" FOREIGN KEY ("claimerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Claim" ("claimerId", "createdAt", "expiringStartedAt", "id", "itemId", "plannedGiveDate", "reminderStage", "status", "updatedAt") SELECT "claimerId", "createdAt", "expiringStartedAt", "id", "itemId", "plannedGiveDate", "reminderStage", "status", "updatedAt" FROM "Claim";
DROP TABLE "Claim";
ALTER TABLE "new_Claim" RENAME TO "Claim";
CREATE INDEX "Claim_itemId_idx" ON "Claim"("itemId");
CREATE INDEX "Claim_claimerId_idx" ON "Claim"("claimerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
