const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../errors/CustomError");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  // Check if token exists
  if (!token) next(new UnauthorizedError("Access token required"));

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) next(new ForbiddenError("Invalid or expired token"));

    // Attach user info to request object
    req.user = user; // Contains { userId, email } from jwt.sign()
    next();
  });
}

module.exports = authenticateToken;
