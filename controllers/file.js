const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../config/cloudinary");
const { BadRequestError, NotFoundError, ConflictError } = require("../errors/CustomError");

const prisma = new PrismaClient();

// Helper
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

async function createFile(req, res, next) {
  // check if folder exists?
  if (!req.file) return next(new BadRequestError("No file uploaded"));

  const userId = req.user.userId;
  let folderId = req.params.folderId;
  if (folderId == null) folderId = await findFolderId("root", userId);
  const maxBytes = 10000000; // 10MB

  const checkStorage = await prisma.user.findFirst({
    // also validates userId
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

  // Save to database in transaction
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
    // Clean up Cloudinary if database fails
    await cloudinary.uploader.destroy(result.public_id, {
      resource_type: result.resource_type,
    });

    return next(dbError);
  }
}

async function updateFilename(req, res, next) {
  const userId = req.user.userId; // JWT
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

async function updateFileLoc(req, res, next) {
  const userId = req.user.userId; // JWT
  const { fileId } = req.params;
  let { newFolderId } = req.body;
  if (newFolderId == null) newFolderId = await findFolderId("root", userId);

  try {
    const updatedFile = await prisma.file.update({
      where: { id: fileId, userId },
      data: {
        folderId: newFolderId,
      },
      select: {
        folderId: true,
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

async function deleteFile(req, res, next) {
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

module.exports = {
  createFile,
  updateFilename,
  updateFileLoc,
  deleteFile,
};
