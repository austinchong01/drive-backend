require("express-async-errors");
const express = require("express");
const request = require("supertest");
const userRouter = require("../routes/userRouter");
const jwt = require("jsonwebtoken");
const prismaErrorHandler = require("../errors/prismaErrorHandler");
const multerErrorHandler = require("../errors/multerErrorHandler");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", userRouter);

// error middleware
app.use((err, req, res, next) => {
  err = multerErrorHandler(err);
  err = prismaErrorHandler(err);

  if (!err.statusCode || err.statusCode >= 500) {
    console.log("Status 500 Error");
    return res.status(500).json({
      error: "InternalServerError",
      message: err.message, // FOR DEVELOPMENT
    });
  }
  res.status(err.statusCode).json({
    error: err.name,
    message: err.message,
  });
});

describe("Register/Delete", () => {
  test("register and delete", async () => {
    const response = await request(app).post("/auth/register").send({
      username: "test",
      email: "test@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");

    const token = response.body.token;
    const deleteResponse = await request(app)
      .delete("/profile/")
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(204);
  });

  test("email in use", async () => {
    const response = await request(app).post("/auth/register").send({
      username: "test",
      email: "test@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(409);

    const jwt = require("jsonwebtoken");
  });

  test("delete invalid userId", async () => {
    // fake token
    const fakeToken = jwt.sign(
      { userId: "fake_user", email: "fake@test.com" },
      process.env.JWT_SECRET,
      { expiresIn: "60s" }
    );

    const deleteResponse = await request(app)
      .delete("/profile/")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(deleteResponse.statusCode).toBe(404);
    expect(deleteResponse.body).toHaveProperty("error");
    expect(deleteResponse.body.error).toBe("NotFoundError");
  });
});

describe("Login", () => {
  let authToken;
  // create test user
  beforeAll(async () => {
    const response = await request(app).post("/auth/register").send({
      username: "loginTestUser",
      email: "logintest@example.com",
      password: "pass123",
    });

    authToken = response.body.token;
  });

  // delete test user
  afterAll(async () => {
      await request(app)
        .delete("/profile/")
        .set("Authorization", `Bearer ${authToken}`);
  });

  test("valid credentials return token", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "logintest@example.com",
      password: "pass123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("invalid password returns 401 Unauthorized", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "logintest@example.com",
      password: "wrongPassword",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("UnauthorizedError");
    expect(response.body.message).toBe("Invalid credentials");
  });

  test("invalid email returns 401 Unauthorized", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "nonexistent@example.com",
      password: "pass123",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("UnauthorizedError");
    expect(response.body.message).toBe("Invalid credentials");
  });
});

describe("Get username", () => {
  let authToken;

  // Setup: Create a test user and get token
  beforeAll(async () => {
    const response = await request(app).post("/auth/register").send({
      username: "getUserTest",
      email: "getuser@test.com",
      password: "password123",
    });

    authToken = response.body.token;
  });

  // Cleanup: Delete test user
  afterAll(async () => {
      await request(app)
        .delete("/profile/")
        .set("Authorization", `Bearer ${authToken}`);
  });

  test("valid token returns username", async () => {
    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("getUserTest");
  });

  test("invalid userId returns 404 NotFoundError", async () => {
    // mock token
    const fakeToken = jwt.sign(
      { userId: "fake_user", email: "fake@test.com" },
      process.env.JWT_SECRET,
      { expiresIn: "60s" }
    );

    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("NotFoundError");
    expect(response.body.message).toContain("not found");
  });
});

describe("Get storage", () => {
  let authToken;

  beforeAll(async () => {
    const response = await request(app).post("/auth/register").send({
      username: "getStorageTest",
      email: "getstorage@test.com",
      password: "password123",
    });

    authToken = response.body.token;
  });

  afterAll(async () => {
    await request(app)
      .delete("/profile/")
      .set("Authorization", `Bearer ${authToken}`);
  });

  test("valid token returns storage", async () => {
    const response = await request(app)
      .get("/storage")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(0); // Default storage value from schema
  });

  test("invalid userId returns 404 NotFoundError", async () => {
    // mock token
    const fakeToken = jwt.sign(
      { userId: "fake_user", email: "fake@test.com" },
      process.env.JWT_SECRET,
      { expiresIn: "60s" }
    );

    const response = await request(app)
      .get("/storage")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("NotFoundError");
  });
});

