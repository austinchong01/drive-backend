-- CreateIndex
CREATE INDEX "files_userId_updatedAt_idx" ON "files"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "folders_userId_updatedAt_idx" ON "folders"("userId", "updatedAt" DESC);
