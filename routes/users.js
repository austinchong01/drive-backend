const express = require("express");
const router = express.Router();
const user = require("../controllers/user")

router.post("/auth/register", (req, res) => {

});

router.post("/auth/login", (req, res) => {
});

router.get("/protected", (req, res) => {
  res.send('Protected Route!')
});

router.get("/profile", (req, res) => {
});
router.get("/storage", (req, res) => {
});
router.patch("/profile", (req, res) => {
});
router.delete("/profile", (req, res) => {
});

module.exports = router;