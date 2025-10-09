require("express-async-errors");
const express = require("express");
const path = require("path");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const prismaErrorHandler = require("../errors/prismaErrorHandler");
const multerErrorHandler = require("../errors/multerErrorHandler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", require("../routes/userRouter"));
app.use("/files", require("../routes/fileRouter"));
app.use("/folders", require("../routes/folderRouter"));
app.use("/api", require("../routes/api"))

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

describe("Search", () => {
  let authToken;
  beforeAll(async () => {
    const response = await request(app).post("/auth/register").send({
      username: "loginTestUser",
      email: "logintest@example.com",
      password: "pass123",
    });
    authToken = response.body.token;
  });
  afterAll(async () => {
    await request(app)
      .delete("/profile/")
      .set("Authorization", `Bearer ${authToken}`);
  });

  // search with no results
  test("No results", async () => {
    const response = await request(app)
      .post(`/api/search`)
      .set("Authorization", `Bearer ${authToken}`)
    expect(response.statusCode).toBe(201);
  });
  
  // search nested files and folders
});
