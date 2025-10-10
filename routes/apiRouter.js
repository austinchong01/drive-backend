const express = require("express");
const router = express.Router();
const api = require("../controllers/api");
const authenticateToken = require("../config/jwt");
const val = require("../middleware/validation")
const limiter = require("../middleware/ratelimiter");

router.get("/search", authenticateToken, val.validateSearch, limiter.api, api.search);

module.exports = router;
