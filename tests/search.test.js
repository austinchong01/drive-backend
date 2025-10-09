require('dotenv').config(); // ← Add this at the TOP
require("express-async-errors");
const express = require("express");
const path = require("path");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const prismaErrorHandler = require("../errors/prismaErrorHandler");
const multerErrorHandler = require("../errors/multerErrorHandler");
const { PrismaClient } = require("@prisma/client");
const { decode } = require("punycode");
const prisma = new PrismaClient();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", require("../routes/userRouter"));
app.use("/files", require("../routes/fileRouter"));
app.use("/folders", require("../routes/folderRouter"));
app.use("/api", require("../routes/apiRouter"));

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

  // search nested files and folders
  test("Nested Files and Folders", async () => {
    // add parentFolder
    const parentFolder = await request(app)
      .post("/folders/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "common",
      });
    const parentFolderId = parentFolder.body.folder.id;
    // add folder to parent folder
    const folder = await request(app)
      .post(`/folders/${parentFolderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "common",
      });
    const folderId = folder.body.folder.id;
    // add file to parent folder
    const t = await request(app)
      .post(`/files/${parentFolderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "COMMON")
      .attach(
        "image",
        path.join(__dirname, "../public/upload_tests/image.jpg")
      );
    // add file to null
    await request(app)
      .post(`/files/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "commonASDF")
      .attach(
        "image",
        path.join(__dirname, "../public/upload_tests/image.jpg")
      );
    // add file to folder
    await request(app)
      .post(`/files/${folderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "asdfcasdf")
      .attach(
        "image",
        path.join(__dirname, "../public/upload_tests/image.jpg")
      );

    const response = await request(app)
      .get(`/api/search?q=c`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(response.body.folders).toHaveLength(2);
    expect(response.body.files).toHaveLength(3);
  });

  // search with no results
  test("No results", async () => {
    const response = await request(app)
      .get(`/api/search?q="      "`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(response.body.folders).toHaveLength(0);
    expect(response.body.files).toHaveLength(0);
  });
});
