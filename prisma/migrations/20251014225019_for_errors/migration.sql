/*
  Warnings:

  - A unique constraint covering the columns `[displayName,folderId]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,parentId]` on the table `folders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "files_folderId_displayName_key";

-- DropIndex
DROP INDEX "folders_parentId_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "files_displayName_folderId_key" ON "files"("displayName", "folderId");

-- CreateIndex
CREATE UNIQUE INDEX "folders_name_parentId_key" ON "folders"("name", "parentId");
