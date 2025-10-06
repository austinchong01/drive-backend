const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const { BadRequestError } = require("../errors/CustomError");

const prisma = new PrismaClient();

async function createFile(req, res, next) {
  // Validation
  if (!req.file) return next(new BadRequestError("No file uploaded"));

  const userId = req.user.userId;
  const folderId = req.params.folderId === "null" ? null : req.params.folderId;

  const base64File = `data:${
    req.file.mimetype
  };base64,${req.file.buffer.toString("base64")}`;

  // upload to cloudinary
  cloudinary.uploader.upload(
    base64File,
    {
      folder: "drive",
      resource_type: "auto",
    },
    async (error, result) => {
      if (error) return next(error);

      // upload to database
      try {
        const newFile = await prisma.file.create({
          data: {
            userId: userId,
            folderId: folderId,
            originalName: req.file.originalname,
            displayName: req.body.displayName,

            cloudinaryUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            cloudinaryResourceType: result.resource_type,

            mimetype: req.file.mimetype,
            size: req.file.size,
          },
        });

        // Increment user storage
        await prisma.user.update({
          where: { id: userId },
          data: {
            storage: { increment: newFile.size },
          },
        });

        res.json({
          success: true,
          message: "File uploaded successfully",
          displayName: newFile.displayName,
        });
      } catch (dbError) {
        // Clean up Cloudinary upload since DB save failed
        await cloudinary.uploader.destroy(result.public_id, {
          resource_type: result.resource_type,
        });

        return next(dbError);
      }
    }
  );
}

// async function download(req, res, next) {

// }

// async function filter(req, res, next) {

// }

async function updateFile(req, res) {
  const userId = req.user.userId; // JWT
  const { newFileName } = req.body;

  const updatedFile = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: newFileName,
    },
    select: {
      username: true,
    },
  });

  return res.json(updatedFile);
}

async function deleteFile(req, res) {
  const userId = req.user.userId; // JWT
  const { fileId } = req.params;

  try {
    const deletedFile = await prisma.file.delete({
      where: { id: fileId, userId },
    });
    
    // Decrement user storage
    await prisma.user.update({
      where: { id: userId },
      data: {
        storage: { decrement: deletedFile.size },
      },
    });

    // Clean up Cloudinary
    await cloudinary.uploader.destroy(deletedFile.cloudinaryPublicId, {
      resource_type: deletedFile.cloudinaryResourceType,
    });

    return res.json(deletedFile);
  } catch (error) {
    return next(error);
  }
}

module.exports = { createFile, updateFile, deleteFile };
