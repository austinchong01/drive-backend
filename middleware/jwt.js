const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../errors/CustomError");

// Authenticates and extracts JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Check token
  if (!token) return next(new UnauthorizedError("Access token required"));

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new ForbiddenError("Invalid or expired token"));

    // Attach user info
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
