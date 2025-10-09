const rateLimit = require("express-rate-limit");

const login = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // 5 login attempts per window
  message:
    "Too many login attempts (5), please try again after 2 minutes",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // do not count successful logins
});

const api = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 requests per window
  message: "Too many requests API requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { login, api };
