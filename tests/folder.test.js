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

describe("Folder w/ JWT", () => {
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

  let folderId;
  test("Create in root", async () => {
    const response = await request(app)
      .post("/folders/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "testFilename",
      });
    expect(response.statusCode).toBe(201);
    folderId = response.body.folder.id;
  });

  test("Create in folder", async () => {
    const response = await request(app)
      .post(`/folders/${folderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "testFolderinFolder",
      });
    expect(response.statusCode).toBe(201);

    // Find the parent folder and check if its children contains the new folder
    const parentFolder = await prisma.folder.findUnique({
      where: { id: response.body.folder.parentId },
      include: { children: true },
    });
    const childExists = parentFolder.children.some(
      (child) => child.id === response.body.folder.id
    );
    expect(childExists).toBe(true);
  });

  test("Get folder contents with subfolders and files", async () => {
    // Create a subfolder inside the root folder
    const subfolderResponse = await request(app)
      .post(`/folders/${folderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "subfolder1",
      });

    // Create first file
    const file1Response = await request(app)
      .post(`/files/${folderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("displayName", "testFileFolder1")
      .attach("image", Buffer.alloc(1000, "a"), "testFileFolder1.jpg");

    // Create second file
    const file2Response = await request(app)
      .post(`/files/${folderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("displayName", "testFileFolder2")
      .attach("image", Buffer.alloc(2000, "b"), "testFileFolder2.png");

    // Get the contents of the root folder
    const getContentsResponse = await request(app)
      .get(`/folders/${folderId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(getContentsResponse.statusCode).toBe(200);

    const returnedSubfolder = getContentsResponse.body.subfolders.find(
      (folder) => folder.id === subfolderResponse.body.folder.id
    );
    expect(returnedSubfolder.name).toBe("subfolder1");
    const returnedFile1 = getContentsResponse.body.files.find(
      (file) => file.id === file1Response.body.file.id
    );
    expect(returnedFile1.displayName).toBe("testFileFolder1");
    const returnedFile2 = getContentsResponse.body.files.find(
      (file) => file.id === file2Response.body.file.id
    );
    expect(returnedFile2.displayName).toBe("testFileFolder2");

    // Cleanup
    await prisma.folder.delete({
      where: { id: folderId },
    });
  });
});
