require("dotenv").config(); // ← Add this at the TOP
require("express-async-errors");
const express = require("express");
const path = require("path");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const prismaErrorHandler = require("../errors/prismaErrorHandler");
const multerErrorHandler = require("../errors/multerErrorHandler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

jest.mock("cloudinary");

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
    // console.log("Status 500 Error");
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

describe("File", () => {
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

  test("Upload w/ null folderId", async () => {
    const response = await request(app)
      .post("/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "MyTestFile")
      .attach(
        "image",
        path.join(__dirname, "../public/upload_tests/image.jpg")
      );
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("file");
    expect(response.body.file.cloudinaryUrl).toBeDefined();
    expect(response.body.file.size).toBe(1847928);
  });

  let foldId;
  test("Upload w/ folderId", async () => {
    const foldRes = await request(app)
      .post(`/folders/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "testFolder",
      });
    foldId = foldRes.body.folder.id;

    const response = await request(app)
      .post(`/files/${foldId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "MyTestFile")
      .attach(
        "image",
        path.join(__dirname, "../public/upload_tests/image.jpg")
      );

    expect(response.statusCode).toBe(201);
    expect(response.body.file.folderId).toBe(foldId);
  });

  test("Upload w/ same displayName in same folder", async () => {
    const response = await request(app)
      .post(`/files/${foldId}/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "MyTestFile")
      .attach(
        "image",
        path.join(__dirname, "../public/upload_tests/image.jpg")
      );
    expect(response.statusCode).toBe(409);
  });

  test("Upload w/ same displayName in same null folder", async () => {
    const response = await request(app)
      .post("/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "MyTestFile")
      .attach(
        "image",
        path.join(__dirname, "../public/upload_tests/image.jpg")
      );
    expect(response.statusCode).toBe(409);
  });

  test("Upload w/o File", async () => {
    const response = await request(app)
      .post("/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "MyTestFile");

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("BadRequestError");
  });

  test("Upload w/o name", async () => {
    const response = await request(app)
      .post("/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach(
        "image",
        path.join(__dirname, "../public/upload_tests/image.jpg")
      );

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("BadRequestError");
  });

  test("Upload, invalid folderId", async () => {
    const response = await request(app)
      .get("/files/INVALIDFOLDERID/upload")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(404);
  });

  test("Database should not save file when Cloudinary upload fails", async () => {
    // Decode the JWT to get userId
    const decoded = jwt.decode(authToken);
    const userId = decoded.userId;

    // Get initial storage and file count
    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
      select: { storage: true },
    });
    const initialStorage = userBefore.storage;

    const filesBeforeCount = await prisma.file.count({
      where: { userId: userId },
    });

    // Mock Cloudinary to throw an error
    const cloudinary = require("cloudinary");
    cloudinary.v2.uploader.upload.mockRejectedValueOnce(
      new Error("Cloudinary upload failed")
    );

    const response = await request(app)
      .post("/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "FailedUploadFile")
      .attach("image", Buffer.alloc(1000, "a"), "test.jpg");
    expect(response.statusCode).toBe(500);

    // Verify NO new file
    const filesAfterCount = await prisma.file.count({
      where: { userId: userId },
    });
    expect(filesAfterCount).toBe(filesBeforeCount);

    // Verify storage not updated
    const userAfter = await prisma.user.findUnique({
      where: { id: userId },
      select: { storage: true },
    });
    expect(userAfter.storage).toBe(initialStorage);

    // Restore the mock for other tests
    cloudinary.v2.uploader.upload.mockResolvedValue({
      secure_url: "https://fake-cloudinary-url.com/test-image.jpg",
      public_id: "fake_public_id_12345",
      resource_type: "image",
    });
  });
});

describe("File w/ JWT and uploadedFile", () => {
  let authToken;
  let fileId;
  beforeAll(async () => {
    const response = await request(app).post("/auth/register").send({
      username: "loginTestUser",
      email: "logintest@example.com",
      password: "pass123",
    });
    authToken = response.body.token;
    const fileResponse = await request(app)
      .post("/files/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "MyTestFile")
      .attach(
        "image",
        path.join(__dirname, "../public/upload_tests/image.jpg")
      );
    fileId = fileResponse.body.file.id;
  });
  afterAll(async () => {
    await request(app)
      .post(`/files/${fileId}`)
      .set("Authorization", `Bearer ${authToken}`);
    await request(app)
      .delete("/profile/")
      .set("Authorization", `Bearer ${authToken}`);
  });

  test("Update filename", async () => {
    const response = await request(app)
      .patch(`/files/${fileId}/updateFileName`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "updatedFilename",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.displayName).toBe("updatedFilename");
  });

  test("Update file location", async () => {
    const folderResponse = await request(app)
      .post(`/folders/upload`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "newFileFolderLoc",
      });
    const newFolderId = folderResponse.body.folder.id;

    const response = await request(app)
      .patch(`/files/${fileId}/updateFileLocation`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        newFolderId: newFolderId,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.folderId).toBe(newFolderId);
  });

  test("File should remain in DB when Cloudinary delete fails", async () => {
    // Mock Cloudinary destroy to fail
    const cloudinary = require("cloudinary");
    cloudinary.v2.uploader.destroy.mockRejectedValueOnce(
      new Error("Cloudinary delete failed")
    );

    // Attempt to delete the file
    await request(app)
      .delete(`/files/${fileId}`)
      .set("Authorization", `Bearer ${authToken}`);

    const fileStillExists = await prisma.file.findUnique({
      where: { id: fileId },
    });
    expect(fileStillExists.id).toBe(fileId);

    // Restore
    cloudinary.v2.uploader.destroy.mockResolvedValue({ result: "ok" });
  });

  test("Delete file successfully", async () => {
    const decoded = jwt.decode(authToken);
    const userId = decoded.userId;

    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
      select: { storage: true },
    });
    const initialStorage = userBefore.storage;
    const fileToDelete = await prisma.file.findUnique({
      where: { id: fileId },
    });
    const fileSize = fileToDelete.size;

    // Delete the file
    const response = await request(app)
      .delete(`/files/${fileId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(response.statusCode).toBe(204);

    // Verify db
    const deletedFile = await prisma.file.findUnique({
      where: { id: fileId },
    });
    expect(deletedFile).toBeNull();
    // Verify storage
    const userAfter = await prisma.user.findUnique({
      where: { id: userId },
      select: { storage: true },
    });
    expect(userAfter.storage).toBe(initialStorage - fileSize);

    // Verify Cloudinary destroy was called
    const cloudinary = require("cloudinary");
    expect(cloudinary.v2.uploader.destroy).toHaveBeenCalled();
  });
});

describe("File w/o JWT", () => {
  // mock token
  const fakeToken = jwt.sign(
    { userId: "fake_user", email: "fake@test.com" },
    process.env.JWT_SECRET,
    { expiresIn: "60s" }
  );

  test("Upload, invalid userId", async () => {
    const response = await request(app)
      .get("/files/upload")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.statusCode).toBe(404);
  });

  test("Upload, storage exceeded", async () => {
    const testUser = await request(app).post("/auth/register").send({
      username: "test",
      email: "TESTUSER@test.com",
      password: "password123",
    });
    const testAuthToken = jwt.sign(
      { userId: testUser.body.user.id },
      process.env.JWT_SECRET,
      { expiresIn: "60s" }
    );

    // Upload 1: Success
    const response1 = await request(app)
      .post("/files/upload")
      .set("Authorization", `Bearer ${testAuthToken}`)
      .field("name", "FirstFile")
      .attach("image", Buffer.alloc(5000000, "a"), "storage1.jpg"); // 5MB

    expect(response1.statusCode).toBe(201);
    expect(response1.body.file).toBeDefined();

    // Upload 2: FAIL - 1MB file would exceed limit (would be 10.5MB)
    const response2 = await request(app)
      .post("/files/upload")
      .set("Authorization", `Bearer ${testAuthToken}`)
      .field("name", "SecondFile")
      .attach("image", Buffer.alloc(5000000, "c"), "storage2.jpg"); // 5MB

    expect(response2.statusCode).toBe(400);
    expect(response2.body.error).toBe("BadRequestError");
    expect(response2.body.message).toBe("Not enough storage");

    // Verify storage did not change
    let userCheck = await prisma.user.findUnique({
      where: { id: testUser.body.user.id },
      select: { storage: true },
    });
    expect(userCheck.storage).toBe(5000000);

    // Cleanup
    await prisma.file.deleteMany({
      where: { userId: testUser.body.user.id },
    });
    await prisma.user.delete({
      where: { id: testUser.body.user.id },
    });
  });
});
