const { body, query, validationResult } = require("express-validator");
const { BadRequestError } = require("../errors/CustomError");

const validateUser = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 1, max: 20 })
    .withMessage("Username must be between 1 and 20 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, hyphens, and periods"
    )
    .escape(),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long")
    .matches(/^[a-zA-Z0-9_.\-@$!%*?&#^()]+$/)
    .withMessage(
      "Password can only contain letters, numbers, underscores, hyphens, periods, and special characters (@$!%*?&#^())"
    ),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return next(new BadRequestError(errors.errors[0].msg));
    next();
  },
];

const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return next(new BadRequestError(errors.errors[0].msg));
    next();
  },
];

const validateName = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 1, max: 30 })
    .withMessage("Name must be between 1 and 30 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Name can only contain letters, numbers, underscores, hyphens, and periods"
    )
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError(errors.errors[0].msg));
    }
    next();
  },
];

const validateSearch = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters")
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new BadRequestError(errors.errors[0].msg));
    }
    next();
  },
];

module.exports = { validateUser, validateLogin, validateName, validateSearch };
