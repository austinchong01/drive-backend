const express = require("express");
const router = express.Router();
const api = require("../controllers/api");
const val = require("../middleware/validation");
const authenticateToken = require("../config/jwt");

router.get("/search", authenticateToken, api.search);

module.exports = router;
