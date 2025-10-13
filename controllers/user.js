const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { NotFoundError, UnauthorizedError } = require("../errors/CustomError");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

async function createUser(req, res) {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (p) => {
    const newUser = await p.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Create root folder
    await p.folder.create({
      data: {
        name: "root",
        userId: newUser.id,
        parentId: null,
      },
    });

    return newUser;
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "48h" }
  );

  return res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    token, // User is logged in immediately
  });
}

async function login(req, res, next) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new UnauthorizedError("Invalid credentials"));

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({ token });
}

async function logout(req, res, next) {
  // With JWT, logout is handled client-side by removing the token
  // Server doesn't need to do anything since JWTs are stateless

  res.json({ message: "Logged out successfully" });
}

async function getUser(req, res, next) {
  const userId = req.user.userId; // JWT

  const foundUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      storage: true,
    },
  });

  if (!foundUser)
    return next(
      new NotFoundError(`Database Error: User with id '${userId}' not found`)
    );

  return res.json(foundUser);
}

async function updateUsername(req, res) {
  const userId = req.user.userId; // JWT
  const { name } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      username: name,
    },
    select: {
      username: true,
    },
  });

  return res.json(updatedUser.username);
}

async function deleteUser(req, res) {
  const userId = req.user.userId; // JWT

  await prisma.user.delete({ where: { id: userId } });

  return res.sendStatus(204);
}

module.exports = {
  createUser,
  getUser,
  updateUsername,
  deleteUser,
  login,
  logout,
};
