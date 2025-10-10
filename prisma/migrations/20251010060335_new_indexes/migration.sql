-- DropIndex
DROP INDEX "files_folderId_idx";

-- DropIndex
DROP INDEX "files_userId_idx";

-- DropIndex
DROP INDEX "folders_parentId_idx";

-- DropIndex
DROP INDEX "folders_parentId_name_key";

-- DropIndex
DROP INDEX "folders_userId_idx";

-- CreateIndex
CREATE INDEX "files_folderId_userId_updatedAt_idx" ON "files"("folderId", "userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "folders_parentId_userId_updatedAt_idx" ON "folders"("parentId", "userId", "updatedAt" DESC);
