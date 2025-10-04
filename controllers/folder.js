const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createFolder(name, userId) {
  try {
    const newFolder = await prisma.folder.create({
      data: {
        name,
        userId,
      },
    });

    console.log("Prisma stored folder successfully:", newFolder.name);
    return newFolder;
  } catch (error) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      throw new Error(`A folder with this ${field} already exists`);
    }
    if (error.code === "P2003") throw new Error("Invalid user reference");

    throw error;
  }
}

async function getFolder(id) {
  const foundFolder = await prisma.folder.findUnique({ where: { id } });

  if (!foundFolder) throw new Error(`Folder with id '${id}' not found`);

  console.log("Folder found successfully:", foundFolder.name);
  return foundFolder;
}

// get all folders given user
async function getAllFolders(userId) {
  const folders = await prisma.folder.findMany({
    where: {
      userId: userId,
    },
  });

  console.log(`Found ${folders.length} file(s) for user ${userId}`);
  return folders;
}

async function updateFolderName(id, name) {
  try {
    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: { name },
    });

    console.log("Folder name updated successfully:", updatedFolder.name);
    return updatedFolder;
  } catch (error) {
    if (error.code === "P2025")
      throw new Error(`Folder with id '${id}' not found`);
    throw error;
  }
}

async function deleteFolder(id) {
  try {
    const deletedFolder = await prisma.folder.delete({ where: { id } });

    console.log("Folder deleted successfully:", deletedFolder.name);
    return deletedFolder;
  } catch (error) {
    if (error.code === "P2025")
      throw new Error(`Folder with id '${id}' not found`);
    throw error;
  }
}

// get all folder given userId
async function getAllFoldersFromUser(userId) {
  const foundFolders = await prisma.folder.findMany({ where: { userId } });

  if (!foundFolders) throw new Error(`Folder with id '${id}' not found`);

  console.log("Folders found successfully:");
  return foundFolders;
}

module.exports = { createFolder, getFolder, updateFolderName, deleteFolder };
