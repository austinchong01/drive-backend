const express = require("express");
const router = express.Router();
const user = require("../controllers/user");
const val = require("../middleware/validation");
const authenticateToken = require("../config/jwt");

router.post("/auth/register", val.validateUser, user.createUser);
router.post("/auth/login", val.validateLogin, user.login);
router.post("/auth/logout", authenticateToken, user.logout);

router.get("/profile", authenticateToken, user.getUser);
router.get("/storage", authenticateToken, user.getStorage);

router.patch("/profile", authenticateToken, val.validateNewUsername, user.updateUsername);

router.delete("/profile/", authenticateToken, user.deleteUser);

module.exports = router;
