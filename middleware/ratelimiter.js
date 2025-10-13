const rateLimit = require("express-rate-limit");
const { TooManyRequestsError } = require("../errors/CustomError");

const login = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 7, // 5 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res, next) => {
    return next(new TooManyRequestsError("Too many login attempts (7), please try again after 2 minutes"));
  },
});

const api = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    return next(new TooManyRequestsError("Too many API requests, please try again later"));
  },
});

module.exports = { login, api };