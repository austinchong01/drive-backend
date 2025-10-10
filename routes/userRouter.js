const express = require("express");
const router = express.Router();
const user = require("../controllers/user");
const val = require("../middleware/validation");
const authenticateToken = require("../config/jwt");
const limiter = require("../middleware/ratelimiter");

router.post("/auth/register", val.validateUser, user.createUser);
router.post("/auth/login", limiter.login, val.validateLogin, user.login);
router.post("/auth/logout", authenticateToken, user.logout);

router.get("/profile", authenticateToken, user.getUser);

router.patch("/profile", authenticateToken, val.validateName, user.updateUsername);

router.delete("/profile", authenticateToken, user.deleteUser);

module.exports = router;
