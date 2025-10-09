const express = require("express");
const router = express.Router();
const api = require("../controllers/api");
const val = require("../middleware/validation");
const authenticateToken = require("../config/jwt");
const limiter = require("../middleware/ratelimiter");

router.get("/search", authenticateToken, limiter.api, api.search);

module.exports = router;
