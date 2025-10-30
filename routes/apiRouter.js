const express = require("express");
const router = express.Router();
const api = require("../controllers/api");
const authenticateToken = require("../middleware/jwt");
const val = require("../middleware/validation");
const limiter = require("../middleware/ratelimiter");

// API route - search

router.get(
  "/search",
  authenticateToken,
  val.validateSearch,
  limiter.api,
  api.search
);

module.exports = router;
