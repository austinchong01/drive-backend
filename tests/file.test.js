require("express-async-errors");
const express = require("express");
const request = require("supertest");
const fileRouter = require("../routes/fileRouter");
const jwt = require("jsonwebtoken");
const prismaErrorHandler = require("../errors/prismaErrorHandler");
const multerErrorHandler = require("../errors/multerErrorHandler");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", fileRouter);

app.use((err, req, res, next) => {
  err = multerErrorHandler(err);
  err = prismaErrorHandler(err);

  if (!err.statusCode || err.statusCode >= 500) {
    console.log("Status 500 Error");
    return res.status(500).json({
      error: "InternalServerError",
      message: err.message,
    });
  }
  res.status(err.statusCode).json({
    error: err.name,
    message: err.message,
  });
});

