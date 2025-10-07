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

  await prisma.folder.delete({ where: { id: folderId } });
  // how to update storage from deleted files in folder

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
