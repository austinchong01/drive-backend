const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Search for folders and files by name
 * Returns results ordered by most recently updated
 */
async function search(req, res) {
  const userId = req.user.userId;
  const { q } = req.query;

  const [folders, files] = await prisma.$transaction([
    prisma.folder.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.file.findMany({
      where: {
        displayName: {
          contains: q,
          mode: "insensitive",
        },
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  res.json({
    folders,
    files,
  });
}

module.exports = { search };