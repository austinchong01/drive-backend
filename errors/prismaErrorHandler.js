const {
    BadRequestError,
    NotFoundError,
    ConflictError,
  } = require("./CustomError");
  
  function handlePrismaError(err) {
    // Check if Prisma error
    if (!err.code || !/^P\d{4}$/.test(err.code)) {
      return err;
    }
  
    // P2002 - Unique constraint violation
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      return new ConflictError(`${field} already exists`);
    }
  
    // P2025 - Record not found
    if (err.code === "P2025") {
      return new NotFoundError("Record not found");
    }
  
    // P2001 - Record does not exist
    if (err.code === "P2001") {
      return new NotFoundError("Related record does not exist");
    }
  
    // P2003 - Foreign key constraint failed
    if (err.code === "P2003") {
      const field = err.meta?.field_name || "related record";
      return new BadRequestError(`Invalid reference: ${field} does not exist`);
    }
  
    // P2011 - Null constraint violation
    if (err.code === "P2011") {
      const field = err.meta?.constraint || "field";
      return new BadRequestError(`${field} cannot be null`);
    }
  
    // P2012 - Missing required value
    if (err.code === "P2012") {
      const field = err.meta?.path || "field";
      return new BadRequestError(`Missing required field: ${field}`);
    }
  
    // P2014 - Relation violation
    if (err.code === "P2014") {
      return new BadRequestError("Required relation is missing");
    }
  
    // P2000 - Value too long for column
    if (err.code === "P2000") {
      const field = err.meta?.column_name || "field";
      return new BadRequestError(`Value for ${field} is too long`);
    }
  
    // Default for unknown Prisma errors
    return new BadRequestError("Database operation failed");
  }
  
  module.exports = handlePrismaError;