const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../config/cloudinary");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require("../errors/CustomError");

const prisma = new PrismaClient();

/**
 * (HELPER FUNCTION)
 * Finds folder ID by name
 */
async function findFolderId(name, userId) {
  const rootFolder = await prisma.folder.findFirst({
    where: {
      userId,
      name,
    },
    select: { id: true },
  });
  return rootFolder.id;
}

/**
 * Upload file to Cloudinary and save metadata to database
 * Validates storage quota
 */
async function createFile(req, res, next) {
  if (!req.file) return next(new BadRequestError("No file uploaded"));

  const userId = req.user.userId;
  let folderId = req.params.folderId;
  if (!folderId) folderId = await findFolderId("root", userId); // "undefined" is "root" folder
  const maxBytes = 10000000; // 10MB

  // Validate user storage quota
  const checkStorage = await prisma.user.findFirst({
    where: { id: userId },
    select: { storage: true },
  });
  if (checkStorage.storage + req.file.size >= maxBytes)
    return next(new BadRequestError("Not enough storage"));

  const base64File = `data:${
    req.file.mimetype
  };base64,${req.file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64File, {
    folder: "drive",
    resource_type: "auto",
  });

  // Save file metadata and update user storage in single transaction
  try {
    const [newFile] = await prisma.$transaction([
      prisma.file.create({
        data: {
          userId,
          folderId,
          originalName: req.file.originalname,
          displayName: req.body.name,
          cloudinaryUrl: result.secure_url,
          cloudinaryPublicId: result.public_id,
          cloudinaryResourceType: result.resource_type,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { storage: { increment: req.file.size } },
      }),
    ]);

    return res.status(201).json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (dbError) {
    // Rollback: clean up Cloudinary if database operation fails
    await cloudinary.uploader.destroy(result.public_id, {
      resource_type: result.resource_type,
    });

    return next(dbError);
  }
}

/**
 * Update filename
 * Validates duplicate names within same folder
 */
async function updateFilename(req, res, next) {
  const userId = req.user.userId;
  const { fileId } = req.params;
  const { name } = req.body;

  try {
    const updatedFile = await prisma.file.update({
      where: { id: fileId, userId },
      data: {
        displayName: name,
      },
      select: {
        displayName: true,
      },
    });
    return res.json(updatedFile);
  } catch (error) {
    if (error.code === "P2002") {
      return next(
        new ConflictError("A file with this name already exists in this folder")
      );
    }
    return next(error);
  }
}

/**
 * Move file to different folder
 * Validates duplicate names and same location
 */
async function updateFileLoc(req, res, next) {
  const userId = req.user.userId;
  const { fileId } = req.params;
  let { newParentId } = req.body;
  if (!newParentId) newParentId = await findFolderId("root", userId); // "undefined" is "root" folder

  try {
    // Check if already in the target location
    const currentFolder = await prisma.file.findUnique({
      where: { id: fileId },
      select: { folderId: true, displayName: true },
    });
    if (currentFolder.folderId === newParentId)
      return res.json({
        name: currentFolder.displayName,
        message: "File already present",
      });

    const updatedFile = await prisma.file.update({
      where: { id: fileId, userId },
      data: {
        folderId: newParentId,
      },
      select: {
        displayName: true,
      },
    });
    return res.json(updatedFile);
  } catch (error) {
    if (error.code === "P2002") {
      return next(
        new ConflictError(
          "A file with this name already exists in the destination folder"
        )
      );
    }
    return next(error);
  }
}

/**
 * Delete file from database and Cloudinary
 * Updates user storage
 */
async function deleteFile(req, res, next) {
  const userId = req.user.userId;
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

  // Remove from Cloudinary first
  await cloudinary.uploader.destroy(fileToDelete.cloudinaryPublicId, {
    resource_type: fileToDelete.cloudinaryResourceType,
  });

  // Delete from database and update storage quota in transaction
  await prisma.$transaction([
    prisma.file.delete({ where: { id: fileId } }),
    prisma.user.update({
      where: { id: userId },
      data: { storage: { decrement: fileToDelete.size } },
    }),
  ]);

  return res.status(204).end();
}

module.exports = {
  createFile,
  updateFilename,
  updateFileLoc,
  deleteFile,
};