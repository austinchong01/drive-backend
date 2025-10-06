const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { NotFoundError } = require("../errors/CustomError");

const prisma = new PrismaClient();

async function createUser(req, res) {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  // need return?
  return res.status(201).json(user);
}

async function getStorage(req, res) {
  const { userId } = req.query; // FOR POSTMAN testing
  // const userId = req.user.id; // From JWT middleware (later)

  const foundUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      storage: true,
    },
  });

  if (!foundUser) throw new NotFoundError(`User with id '${userId}' not found`);

  return res.json(foundUser.storage);
}

async function findUser(req, res) {
  const { userId } = req.query; // FOR POSTMAN testing
  // const userId = req.user.id; // From JWT middleware (later)

  const foundUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
    },
  });

  if (!foundUser) throw new NotFoundError(`User with id '${userId}' not found`);

  return res.json(foundUser);
}

async function updateUsername(req, res) {
  const { userId } = req.query; // FOR POSTMAN testing
  // const userId = req.user.id; // From JWT middleware (later)

  const { newName } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      username: newName,
    },
    select: {
      username: true,
    },
  });

  // need return?
  return res.json(updatedUser);
}

async function deleteUser(req, res) {
  const { userId } = req.query; // FOR POSTMAN testing
  // const userId = req.user.id; // From JWT middleware (later)

  const deletedUser = await prisma.user.delete({ where: { id: userId } });

  // need return?
  return res.json(deletedUser);
}

module.exports = {
  createUser,
  findUser,
  getStorage,
  updateUsername,
  deleteUser,
};
