const express = require("express");
const router = express.Router();
const user = require("../controllers/user")

router.post("/auth/register", user.createUser);

// router.post("/auth/login", user.login);
// router.post("/auth/logout", user.logout);

// router.get("/protected", (req, res) => {
//   res.send('Protected Route!')
// });

router.get("/profile", user.findUser);
router.get("/storage", user.getStorage);
router.patch("/profile", user.updateUsername);
router.delete("/profile", user.deleteUser);

module.exports = router;