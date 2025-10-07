const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const { BadRequestError, NotFoundError } = require("../errors/CustomError");

const prisma = new PrismaClient();

async function createFolder(req, res, next) {
  const userId = req.user.userId;
  const folderId = req.params.folderId;
  const { name } = req.body;

  const folder = await prisma.user.create({
    data: {
      name,
      userId,
      parentId: folderId,
    },
  });

  return res.status(201).json({
    message: "Folder created successfully",
    folder,
  });
}

async function getContents(req, res) {
  const userId = req.user.userId;
  const folderId = req.params.folderId;

  const subfolders = await prisma.folder.findMany({
    where: {
      parentId: folderId,
      userId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const files = await prisma.file.findMany({
    where: {
      folderId: folderId,
      userId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  res.json({
    subfolders,
    files,
  });
}

async function getBreadCrumbs(req, res, next) {
  const userId = req.user.userId;
  let folderId = req.params.folderId;

  const breadcrumbs = [];

  while (folderId !== null) {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    if (!folder)
      return next(new NotFoundError(`Database Error: Folder not found`));

    breadcrumbs.unshift({
      id: folder.id,
      name: folder.name,
    });

    folderId = folder.parentId;
  }

  res.json({
    breadcrumbs,
  });
}

async function updateFolder(req, res) {
  const userId = req.user.userId; // JWT
  const { folderId } = req.params;
  const { displayName } = req.body;

  const updatedFolder = await prisma.folder.update({
    where: { id: folderId, userId },
    data: {
      name: displayName,
    },
    select: {
      name: true,
    },
  });

  return res.json(updatedFolder);
}

// check if newParentId exists?
async function updateFolderLoc(req, res) {
  const userId = req.user.userId; // JWT
  const { folderId } = req.params;
  const { newParentId } = req.body;

  const updatedFolder = await prisma.folder.update({
    where: { id: folderId, userId },
    data: {
      parentId: newParentId,
    },
    select: {
      name: true,
    },
  });

  return res.json(updatedFolder);
}

async function deleteFolder(req, res, next) {
  const userId = req.user.userId; // JWT
  const { folderId } = req.params;

  // security check
  // prevent using userId in next queries
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
    },
  });
  if (!folder) 
    return next(new NotFoundError('Folder not found or access denied'));


  // get all folderIds within folderId
  const foldersToCheck = [folderId];
  const allFolderIds = [];

  while (foldersToCheck.length !== 0) {
    const currFolder = foldersToCheck.pop();
    allFolderIds.push(currFolder);

    const subfolders = await prisma.folder.findMany({
      where: {
        parentId: currFolder,
      },
      select: {
        id: true,
      },
    });

    foldersToCheck.push(...subfolders.map((sf) => sf.id));
  }

  // Single aggregate for ALL files
  const totalStorage = await prisma.file.aggregate({
    where: {
      folderId: { in: allFolderIds },
    },
    _sum: { size: true },
  });

  const storageToFree = totalStorage._sum.size || 0;

  // delete all files and folders in folderId
  await prisma.folder.delete({
    where: {
      id: folderId,
    },
  });

  // update User storage
  await prisma.user.update({
    where: { id: userId },
    data: { storage: { decrement: storageToFree } },
  });

  return res.status(204).end();
}

module.exports = {
  createFolder,
  getContents,
  getBreadCrumbs,
  updateFolder,
  updateFolderLoc,
  deleteFolder,
};
