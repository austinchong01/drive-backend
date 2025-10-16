require("dotenv").config(); // ← Add this at the TOP
require("express-async-errors");
const express = require("express");
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
    console.log(err.message)
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
        name: "testFolderName",
      });
    expect(response.statusCode).toBe(201);
    folderId = response.body.folder.id;
  });

  test("Create same name folder in root", async () => {
    const response = await request(app)
      .post("/folders/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "testFolderName",
      });
    expect(response.statusCode).toBe(409);
  });

  let testFolderinFolderId;
  test("Create in folder", async () => {
    const response = await request(app)
      .post(`/folders/${folderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "testFolderInFolder",
      });
    expect(response.statusCode).toBe(201);

    // Find the parent folder and check if its children contains the new folder
    const check = await prisma.folder.findUnique({
      where: { id: response.body.folder.id },
      select: { parentId: true },
    });
    expect(check.parentId === folderId).toBe(true);
    testFolderinFolderId = response.body.folder.id;
  });

  let breadFolderId;
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
      .field("name", "testFileFolder1")
      .attach("image", Buffer.alloc(1000, "a"), "testFileFolder1.jpg");

    // Create second file
    const file2Response = await request(app)
      .post(`/files/${folderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "testFileFolder2")
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

    breadFolderId = subfolderResponse.body.folder.id;
  });

  test("Breadcrumb", async () => {
    const breadcrumb = await request(app)
      .get(`/folders/${breadFolderId}/crumbs`)
      .set("Authorization", `Bearer ${authToken}`);
    const result = breadcrumb.body.breadcrumbs;
    expect(breadcrumb.body.breadcrumbs.length === 2);
    expect(result[0].id == folderId);
    expect(result[1].id == breadFolderId);
  });

  test("Update Name", async () => {
    const newName = await request(app)
      .patch(`/folders/${breadFolderId}/newFolderName`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "updatedFolderName",
      });
    expect(newName.body.name == "updatedFolderName");
  });

  test("Update Location", async () => {
    await request(app)
      .patch(`/folders/${breadFolderId}/newFolderLocation`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        newParentId: null,
      });

    const newFolderParent = await prisma.folder.findUnique({
      where: { id: breadFolderId },
      select: { parentId: true },
    });
    const rootFolder = await prisma.folder.findFirst({
      where: {
        userId: jwt.decode(authToken).userId,
        name: "root",
      },
      select: { id: true },
    });

    expect(newFolderParent.parentId).toBe(rootFolder.id);
  });

  test("Delete a nested Folder", async () => {
    await request(app)
      .post(`/files/${testFolderinFolderId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "testFileFolder3")
      .attach("image", Buffer.alloc(1000, "a"), "testFileFolder3.jpg");

    const response = await request(app)
      .delete(`/folders/${folderId}/`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(response.statusCode).toBe(204);

    // check storage
    const decoded = jwt.decode(authToken);
    const userId = decoded.userId;
    const currStorage = await prisma.user.findUnique({
      where: { id: userId },
      select: { storage: true },
    });
    expect(currStorage.storage).toBe(0);

    // check if files and folders still exist
    const foundFolders = await prisma.folder.findMany({
      where: { parentId: folderId },
    });
    const foundFiles = await prisma.file.findMany({ where: { folderId } });
    expect(foundFolders).toHaveLength(0);
    expect(foundFiles).toHaveLength(0);
  });
});
