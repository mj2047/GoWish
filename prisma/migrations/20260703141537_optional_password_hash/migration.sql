-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "profilePhotoUrl" TEXT,
    "username" TEXT NOT NULL,
    "publicShareSlug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "passwordHash", "phone", "profilePhotoUrl", "publicShareSlug", "updatedAt", "username") SELECT "createdAt", "email", "id", "name", "passwordHash", "phone", "profilePhotoUrl", "publicShareSlug", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_publicShareSlug_key" ON "User"("publicShareSlug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
