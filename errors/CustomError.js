// errors/CustomError.js

// Client Errors (User's Fault)

// 400 Bad Request
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = "BadRequestError";
  }
}

// 401 Unauthorized (not logged in or invalid credentials)
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
    this.name = "UnauthorizedError";
  }
}

// 403 Forbidden (logged in but no permission)
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
    this.name = "ForbiddenError";
  }
}

// 404 Not Found (resource does not exist)
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = "NotFoundError";
  }
}

// 409 Conflict Request (conflicts with current state)
class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
    this.name = "ConflictError";
  }
}

// 429 Too many requests
class TooManyRequestsError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 429;
    this.name = "TooManyRequestsError";
  }
}


module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
};