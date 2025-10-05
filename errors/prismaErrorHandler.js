// errors/prismaErrorHandler.js
const { 
    BadRequestError, 
    NotFoundError, 
    ConflictError 
  } = require('./CustomError');
  
  function handlePrismaError(error) {
    // P2002 - Unique constraint violation
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field";
      throw new ConflictError(`${field} already exists`);
    }
    
    // P2025 - Record not found (for update/delete operations)
    if (error.code === "P2025") {
      throw new NotFoundError("Record not found");
    }
    
    // P2003 - Foreign key constraint failed
    if (error.code === "P2003") {
      const field = error.meta?.field_name || "related record";
      throw new BadRequestError(`Invalid reference: ${field} does not exist`);
    }
    
    // P2014 - Relation violation (required relation missing)
    if (error.code === "P2014") {
      throw new BadRequestError("Required relation is missing");
    }
    
    // P2000 - Value too long for column
    if (error.code === "P2000") {
      const field = error.meta?.column_name || "field";
      throw new BadRequestError(`Value for ${field} is too long`);
    }
    
    // P2001 - Record does not exist (for nested operations)
    if (error.code === "P2001") {
      throw new NotFoundError("Related record does not exist");
    }
    
    // P2011 - Null constraint violation
    if (error.code === "P2011") {
      const field = error.meta?.constraint || "field";
      throw new BadRequestError(`${field} cannot be null`);
    }
    
    // P2012 - Missing required value
    if (error.code === "P2012") {
      const field = error.meta?.path || "field";
      throw new BadRequestError(`Missing required field: ${field}`);
    }
    
    // For unknown Prisma errors, rethrow
    throw error;
  }
  
  module.exports = handlePrismaError;