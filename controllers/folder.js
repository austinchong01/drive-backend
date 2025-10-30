const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../config/cloudinary");
const { ConflictError, NotFoundError } = require("../errors/CustomError");

const prisma = new PrismaClient();

/**
 * (HELPER FUNCTION)
 * Finds folder ID by name
 */
async function findFolderId(name, userId) {
  const rootFolder = await prisma.folder.findFirst({
    where: {
      userId,
      name: name,
    },
    select: { id: true },
  });
  return rootFolder.id;
}

/**
 * Create new folder
 * Validates duplicate names within parent folder
 */
async function createFolder(req, res, next) {
  const userId = req.user.userId;
  let folderId = req.params.folderId;
  if (!folderId) folderId = await findFolderId("root", userId); // "undefined" is "root" folder
  const { name } = req.body;

  const folder = await prisma.folder.create({
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

/**
 * Get folder contents (subfolders and files)
 * Returns contents ordered by most recently updated
 */
async function getContents(req, res) {
  const userId = req.user.userId;
  let folderId = req.params.folderId;
  if (!folderId) folderId = await findFolderId("root", userId); // "undefined" is "root" folder

  // Query subfolders and files in transaction
  const [subfolders, files] = await prisma.$transaction([
    prisma.folder.findMany({
      where: {
        parentId: folderId,
        userId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.file.findMany({
      where: {
        folderId: folderId,
        userId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  res.json({
    subfolders,
    files,
  });
}

/**
 * Get breadcrumb navigation path
 * Traverses from current folder up to root
 */
async function getBreadCrumbs(req, res, next) {
  const userId = req.user.userId;
  let folderId = req.params.folderId;
  if (!folderId) folderId = await findFolderId("root", userId); // "undefined" is "root" folder

  const breadcrumbs = [];

  // Traverse to "root"
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

/**
 * Update folder name
 * Validates duplicate names within same parent folder
 */
async function updateFolder(req, res, next) {
  const userId = req.user.userId;
  let { folderId } = req.params;
  const { name } = req.body;

  try {
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId, userId },
      data: {
        name,
      },
    });
    return res.json(updatedFolder);
  } catch (error) {
    if (error.code === "P2002") {
      return next(
        new ConflictError(
          "A folder with this name already exists in the parent folder"
        )
      );
    }
    return next(error);
  }
}

/**
 * Move folder to different parent folder
 * Validates duplicate names, same location, and prevents circular nesting
 */
async function updateFolderLoc(req, res, next) {
  const userId = req.user.userId;
  let { folderId } = req.params;
  if (!folderId) folderId = await findFolderId("root", userId); // "undefined" is "root" folder
  let { newParentId } = req.body;
  if (!newParentId) newParentId = await findFolderId("root", userId); // "undefined" is "root" folder

  /**
   * (HELPER FUNCTION - recursion)
   * Check if child is a descendant of ancestor
   */
  async function isDescendant(childId, ancestorId) {
    if (!childId) return false; // Reached parent folder of root
    if (childId === ancestorId) return true;

    const folder = await prisma.folder.findUnique({
      where: { id: childId },
      select: { parentId: true },
    });

    if (!folder) return false;
    return isDescendant(folder.parentId, ancestorId);
  }

  try {
    // Check if already in the target location
    const currentFolder = await prisma.folder.findUnique({
      where: { id: folderId },
      select: { parentId: true, name: true },
    });
    if (currentFolder.parentId === newParentId)
      return res.json({
        name: currentFolder.name,
        message: "Folder already present",
      });

    // Prevent moving folder into its own descendant (circular nesting)
    const checkDescendant = await isDescendant(newParentId, folderId);
    if (checkDescendant)
      return next(
        new ConflictError("Cannot move a folder into its own descendant")
      );

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
  } catch (error) {
    if (error.code === "P2002") {
      return next(
        new ConflictError(
          "A folder with this name already exists in the destination folder"
        )
      );
    }
    return next(error);
  }
}

/**
 * Delete folder and all nested contents
 * Removes files from Cloudinary and updates user storage
 */
async function deleteFolder(req, res, next) {
  const userId = req.user.userId;
  let { folderId } = req.params;

  // Verify user ownership
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
    },
  });
  if (!folder)
    return next(new NotFoundError("Folder not found or access denied"));

  const foldersToCheck = [folderId];
  const allFolderIds = [];
  const allFileIds = [];

  // Traverse all nested folders and store IDs
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

    const subFiles = await prisma.file.findMany({
      where: {
        folderId: currFolder,
      },
      select: {
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
      },
    });

    allFileIds.push(...subFiles);
    foldersToCheck.push(...subfolders.map((sf) => sf.id));
  }

  // Remove all nested files from Cloudinary
  for (let i = 0; i < allFileIds.length; i++) {
    await cloudinary.uploader.destroy(allFileIds[i].cloudinaryPublicId, {
      resource_type: allFileIds[i].cloudinaryResourceType,
    });
  }

  // Delete folder and update storage in transaction
  await prisma.$transaction(async (p) => {
    // Calculate total storage to free
    const totalStorage = await p.file.aggregate({
      where: {
        folderId: { in: allFolderIds },
      },
      _sum: { size: true },
    });
    const storageToFree = totalStorage._sum.size || 0;

    await p.folder.delete({
      where: {
        id: folderId,
      },
    });

    await p.user.update({
      where: { id: userId },
      data: { storage: { decrement: storageToFree } },
    });
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