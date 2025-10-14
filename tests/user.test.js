require('dotenv').config(); // ← Add this at the TOP
require("express-async-errors");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const prismaErrorHandler = require("../errors/prismaErrorHandler");
const multerErrorHandler = require("../errors/multerErrorHandler");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", require("../routes/userRouter"));

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

describe("User Register/Delete", () => {
  let token;
  test("Register", async () => {
    const response = await request(app).post("/auth/register").send({
      username: "test",
      email: "USERTEST@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");

    token = response.body.token;
  });

  test("Email in use", async () => {
    const response = await request(app).post("/auth/register").send({
      username: "test",
      email: "USERTEST@test.com",
      password: "password123",
    });
    expect(response.statusCode).toBe(409);
    expect(response.body.error).toBe("ConflictError");
  });

  test("Delete", async () => {
    const response = await request(app)
      .delete("/profile/")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
  });
});

describe("User Tests w/ JWT", () => {
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

  test("Login", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "logintest@example.com",
      password: "pass123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("Update username", async () => {
    const response = await request(app)
      .patch("/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "updatedTestUser",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("updatedTestUser");
  });

  test("Get storage", async () => {
    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.storage).toBe(0); // Default storage value from schema
  });
});

describe("User Tests w/o JWT", () => {
  test("invalid password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "logintest@example.com",
      password: "wrongPassword",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("UnauthorizedError");
    expect(response.body.message).toBe("Invalid credentials");
  });

  test("invalid email", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "nonexistent@example.com",
      password: "pass123",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("UnauthorizedError");
    expect(response.body.message).toBe("Invalid credentials");
  });

  // mock token
  const fakeToken = jwt.sign(
    { userId: "fake_user", email: "fake@test.com" },
    process.env.JWT_SECRET,
    { expiresIn: "60s" }
  );

  test("invalid getUser", async () => {
    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("NotFoundError");
  });

  test("invalid getStorage", async () => {
    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("NotFoundError");
  });

  test("invalid delete", async () => {
    const deleteResponse = await request(app)
      .delete("/profile/")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(deleteResponse.statusCode).toBe(404);
    expect(deleteResponse.body).toHaveProperty("error");
    expect(deleteResponse.body.error).toBe("NotFoundError");
  });
});
