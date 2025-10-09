const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function search(req, res) {
  const userId = req.user.userId;
  const { q } = req.query;

  const folders = await prisma.folder.findMany({
    where: {
      name: q,
      userId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const files = await prisma.file.findMany({
    where: {
      name: q,
      userId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  res.json({
    folders,
    files,
  });
}

module.exports = { search };
