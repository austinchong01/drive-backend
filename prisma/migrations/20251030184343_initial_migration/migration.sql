-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "storage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "cloudinaryUrl" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "cloudinaryResourceType" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "files_cloudinaryUrl_key" ON "files"("cloudinaryUrl");

-- CreateIndex
CREATE INDEX "files_displayName_idx" ON "files"("displayName");

-- CreateIndex
CREATE INDEX "files_userId_updatedAt_idx" ON "files"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "files_folderId_userId_updatedAt_idx" ON "files"("folderId", "userId", "updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "files_displayName_folderId_key" ON "files"("displayName", "folderId");

-- CreateIndex
CREATE INDEX "folders_name_idx" ON "folders"("name");

-- CreateIndex
CREATE INDEX "folders_userId_updatedAt_idx" ON "folders"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "folders_parentId_userId_updatedAt_idx" ON "folders"("parentId", "userId", "updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "folders_name_parentId_key" ON "folders"("name", "parentId");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
