const express = require("express");
const router = express.Router();
const user = require("../controllers/user");
const val = require("../middleware/validation");
const authenticateToken = require("../middleware/jwt");
const limiter = require("../middleware/ratelimiter");

// User routes - create, authenticate, verify, update, and delete

router.post("/auth/register", val.validateUser, user.createUser);
router.post("/auth/login", limiter.login, val.validateLogin, user.login);
router.get("/auth/verify", authenticateToken, user.verify);

router.get("/profile", authenticateToken, user.getUser);

router.patch(
  "/profile",
  authenticateToken,
  val.validateName,
  user.updateUsername
);

router.delete("/profile", authenticateToken, user.deleteUser);

module.exports = router;