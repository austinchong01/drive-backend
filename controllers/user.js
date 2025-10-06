const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { NotFoundError, UnauthorizedError } = require("../errors/CustomError");
const jwt = require("jsonwebtoken");

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

  // Create JWT token immediately after registration
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    },
    token // User is logged in immediately
  });
}

async function getStorage(req, res) {
  // const { userId } = req.query; // FOR POSTMAN testing
  const userId = req.user.userId; // From JWT middleware

  const foundUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      storage: true,
    },
  });

  if (!foundUser) throw new NotFoundError(`User with id '${userId}' not found`);

  return res.json(foundUser.storage);
}

async function getUser(req, res) {
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

async function login(req, res) {
  const { email, password } = req.body;

  // Find user and verify password
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new UnauthorizedError("Invalid credentials");

  // Create JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({ token });
}

async function logout(req, res) {
  // With JWT, logout is handled client-side by removing the token
  // Server doesn't need to do anything since JWTs are stateless

  res.json({ message: "Logged out successfully" });
}

module.exports = {
  createUser,
  getUser,
  getStorage,
  updateUsername,
  deleteUser,
  login,
  logout,
};
