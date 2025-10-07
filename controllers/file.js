const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const { BadRequestError, NotFoundError } = require("../errors/CustomError");

const prisma = new PrismaClient();

async function createFile(req, res, next) {
  // Validation
  if (!req.file) return next(new BadRequestError("No file uploaded"));

  const userId = req.user.userId;
  const folderId = req.params.folderId === "null" ? null : req.params.folderId; // not sure if I need this

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

async function download(req, res, next) {
  const userId = req.user.userId; // JWT
  const { fileId } = req.params;

  const file = await prisma.file.findUnique({
    where: { id: fileId, userId },
    select: { cloudinaryUrl: true, displayName: true },
  });

  if (!file)
    return next(
      new NotFoundError(
        `Database Error: File with id '${fileId}' not found in User's files`
      )
    );

  const downloadUrl = file.cloudinaryUrl.replace(
    "/upload/",
    `/upload/fl_attachment:${encodeURIComponent(file.displayName)}/`
  );

  res.json(downloadUrl);
  // res.redirect(downloadUrl); // for DEPLOY
}

async function updateFile(req, res) {
  const userId = req.user.userId; // JWT
  const { fileId } = req.params;
  const { displayName } = req.body;

  const updatedFile = await prisma.file.update({
    where: { id: fileId, userId },
    data: {
      displayName: displayName,
    },
    select: {
      displayName: true,
    },
  });

  return res.json(updatedFile);
}

async function deleteFile(req, res, next) {
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

module.exports = { createFile, download, updateFile, deleteFile };
