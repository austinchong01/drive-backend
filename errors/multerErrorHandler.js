const multer = require("multer");
const { BadRequestError } = require("./CustomError");

function multerErrorHandler(err) {
  if (err instanceof multer.MulterError){
    return new BadRequestError(`${err.message}`);
  } else {
    return err;
  }
}

module.exports = multerErrorHandler;
