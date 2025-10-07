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

async function deleteFolder(req, res, next) {
  const userId = req.user.userId; // JWT
  const { fileId } = req.params;

  const fileToDelete = await prisma.file.findUnique({
    where: { id: fileId, userId },
    select: {
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
      size: true,
    },
  });

  if (!fileToDelete) return next(new NotFoundError("File not found"));

  // Remove from cloudinary. Does not delete from database if fails
  await cloudinary.uploader.destroy(fileToDelete.cloudinaryPublicId, {
    resource_type: fileToDelete.cloudinaryResourceType,
  });

  // Delete from database in transaction
  await prisma.$transaction([
    prisma.file.delete({ where: { id: fileId } }),
    prisma.user.update({
      where: { id: userId },
      data: { storage: { decrement: fileToDelete.size } },
    }),
  ]);

  return res.status(204).end();
}

module.exports = { createFolder, updateFolder, deleteFolder };
