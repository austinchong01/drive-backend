const { body, validationResult } = require("express-validator");
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

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return next(new BadRequestError(errors.errors[0].msg));
    next();
  },
];

const validateNewUsername = [
  body("newName")
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

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return next(new BadRequestError(errors.errors[0].msg));
    next();
  },
];

const validateFileName = [
  body("displayName")
    .trim()
    .notEmpty()
    .withMessage("Filename is required")
    .isLength({ min: 1, max: 20 })
    .withMessage("Filename must be between 1 and 20 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Filename can only contain letters, numbers, underscores, hyphens, and periods"
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

const validateFolderName = [
  body("displayName")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required")
    .isLength({ min: 1, max: 20 })
    .withMessage("Folder name must be between 1 and 20 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Folder name can only contain letters, numbers, underscores, hyphens, and periods"
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


module.exports = { validateUser, validateLogin, validateNewUsername, validateFileName, validateFolderName };
