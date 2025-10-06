const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/multer");
const cloudinary = require("../config/cloudinary");

const prisma = new PrismaClient();

async function createFile(req, res, next) {
  // Validation
  if (!req.file) return next(new BadRequestError("No file uploaded"));

  const userId = req.user.userId;
  const { folderId } = req.params;

  // multer
  upload.single("image")(req, res, (err) => {
    // multer error check
    if (err) return next(new BadRequestError(err.message));

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
  });
}

// async function download(req, res, next) {
  
// }

// async function filter(req, res, next) {

// }

async function updateFile(req, res) {
  const userId = req.user.id; // JWT
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
  const userId = req.user.id; // JWT
  const { fileId } = req.params;

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

  return res.json(deletedFile);
}

module.exports = { createFile, updateFile, deleteFile };
