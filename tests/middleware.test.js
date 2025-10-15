require("dotenv").config(); // ← Add this at the TOP
require("express-async-errors");
const val = require("../middleware/validation");
const express = require("express");
const request = require("supertest");
const prismaErrorHandler = require("../errors/prismaErrorHandler");
const multerErrorHandler = require("../errors/multerErrorHandler");
const app = express();
const path = require("path");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", require("../routes/userRouter"));
app.use("/files", require("../routes/fileRouter"));

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

describe("Validation", () => {
  describe("User", () => {
    describe("username", () => {
      const runValidation = async (username) => {
        const req = {
          body: {
            username,
            email: "test@example.com",
            password: "password123",
          },
        };
        const res = {};
        let error;
        const next = (err) => {
          error = err;
        };

        for (const validator of val.validateUser) {
          await validator(req, res, next);
        }

        return error;
      };

      test("valid username passes", async () => {
        const error = await runValidation("testuser123");
        expect(error).toBeUndefined();
      });

      test("empty username fails", async () => {
        const error = await runValidation("");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Username is required");
      });

      test("username too long fails", async () => {
        const error = await runValidation("a".repeat(21));
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe(
          "Username must be between 1 and 20 characters"
        );
      });

      test("username with invalid characters fails", async () => {
        const error = await runValidation("test user!");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe(
          "Username can only contain letters, numbers, underscores, hyphens, and periods"
        );
      });
    });

    describe("email", () => {
      const runValidation = async (email) => {
        const req = {
          body: { username: "testuser", email, password: "password123" },
        };
        const res = {};
        let error;
        const next = (err) => {
          error = err;
        };

        for (const validator of val.validateUser) {
          await validator(req, res, next);
        }

        return error;
      };

      test("valid email passes", async () => {
        const error = await runValidation("test@example.com");
        expect(error).toBeUndefined();
      });

      test("empty email fails", async () => {
        const error = await runValidation("");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Email is required");
      });

      test("invalid email format fails", async () => {
        const error = await runValidation("notanemail");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Must be a valid email address");
      });

      test("email without @ fails", async () => {
        const error = await runValidation("test.example.com");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Must be a valid email address");
      });

      test("email without domain fails", async () => {
        const error = await runValidation("test@");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Must be a valid email address");
      });
    });

    describe("password", () => {
      const runValidation = async (password) => {
        const req = {
          body: { username: "testuser", email: "test@example.com", password },
        };
        const res = {};
        let error;
        const next = (err) => {
          error = err;
        };

        for (const validator of val.validateUser) {
          await validator(req, res, next);
        }

        return error;
      };

      test("valid password passes", async () => {
        const error = await runValidation("password123");
        expect(error).toBeUndefined();
      });

      test("empty password fails", async () => {
        const error = await runValidation("");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Password is required");
      });

      test("password too short fails", async () => {
        const error = await runValidation("abc");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe(
          "Password must be at least 4 characters long"
        );
      });

      test("password with invalid characters fails", async () => {
        const error = await runValidation("pass word+");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe(
          "Password can only contain letters, numbers, underscores, hyphens, periods, and special characters (@$!%*?&#^())"
        );
      });

      test("password with special characters passes", async () => {
        const error = await runValidation("pass@$!%*?&#^()");
        expect(error).toBeUndefined();
      });
    });
  });

  describe("Login", () => {
    describe("email", () => {
      const runValidation = async (email) => {
        const req = { body: { email, password: "password123" } };
        const res = {};
        let error;
        const next = (err) => {
          error = err;
        };

        for (const validator of val.validateLogin) {
          await validator(req, res, next);
        }

        return error;
      };

      test("valid email passes", async () => {
        const error = await runValidation("test@example.com");
        expect(error).toBeUndefined();
      });

      test("empty email fails", async () => {
        const error = await runValidation("");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Email is required");
      });

      test("invalid email format fails", async () => {
        const error = await runValidation("notanemail");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Must be a valid email address");
      });

      test("email without @ fails", async () => {
        const error = await runValidation("test.example.com");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Must be a valid email address");
      });

      test("email without domain fails", async () => {
        const error = await runValidation("test@");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Must be a valid email address");
      });
    });
    describe("password", () => {
      const runValidation = async (password) => {
        const req = { body: { email: "test@example.com", password } };
        const res = {};
        let error;
        const next = (err) => {
          error = err;
        };

        for (const validator of val.validateLogin) {
          await validator(req, res, next);
        }

        return error;
      };

      test("valid password passes", async () => {
        const error = await runValidation("password123");
        expect(error).toBeUndefined();
      });

      test("empty password fails", async () => {
        const error = await runValidation("");
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Password is required");
      });
    });
  });

  describe("New Name", () => {
    const runValidation = async (name) => {
      const req = { body: { name } };
      const res = {};
      let error;
      const next = (err) => {
        error = err;
      };

      for (const validator of val.validateName) {
        await validator(req, res, next);
      }

      return error;
    };

    test("valid name passes", async () => {
      const error = await runValidation("document123");
      expect(error).toBeUndefined();
    });

    test("empty name fails", async () => {
      const error = await runValidation("");
      expect(error.statusCode).toBe(400);
    });

    test("name too long fails", async () => {
      const error = await runValidation("a".repeat(31));
      expect(error.statusCode).toBe(400);
    });

    test("name with invalid characters fails", async () => {
      const error = await runValidation("my file!");
      expect(error.statusCode).toBe(400);
    });

    test("name with valid special characters passes", async () => {
      const error = await runValidation("file_name-123.txt");
      expect(error).toBeUndefined();
    });
  });
});

describe("Rate Limiter", () => {
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

  describe("Login", () => {
    test("5 failed, 1 success, 2 failed, 8th blocked", async () => {
      // Make 3 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app).post("/auth/login").send({
          email: "logintest@example.com",
          password: "wrongpassword",
        });
      }

      // Make a successful login - should NOT be counted
      const successResponse = await request(app).post("/auth/login").send({
        email: "logintest@example.com",
        password: "pass123",
      });
      expect(successResponse.status).toBe(200);
      expect(successResponse.body.token).toBeDefined();

      // Make 2 more failed attempts (total 5 failed)
      for (let i = 0; i < 2; i++) {
        const response = await request(app).post("/auth/login").send({
          email: "logintest@example.com",
          password: "wrongpassword",
        });
        expect(response.status).toBe(401);
      }

      // 6th failed attempt should be blocked
      const blockedResponse = await request(app).post("/auth/login").send({
        email: "logintest@example.com",
        password: "wrongpassword",
      });
      expect(blockedResponse.status).toBe(429);
    });

    // test("should reset rate limit after 2 minutes", async () => {
    //   // Make 5 failed attempts to trigger rate limit
    //   for (let i = 0; i < 5; i++) {
    //     await request(app).post("/auth/login").send({
    //       email: "logintest@example.com",
    //       password: "wrongpassword",
    //     });
    //   }

    //   // Verify we're blocked
    //   const blockedResponse = await request(app).post("/auth/login").send({
    //     email: "logintest@example.com",
    //     password: "wrongpassword",
    //   });
    //   expect(blockedResponse.status).toBe(429);

    //   // Wait 2 minutes + buffer (2 minutes = 120,000ms)
    //   await new Promise((resolve) => setTimeout(resolve, 121000));

    //   // Should be able to login again
    //   const response = await request(app).post("/auth/login").send({
    //     email: "logintest@example.com",
    //     password: "wrongpassword",
    //   });

    //   expect(response.status).toBe(401); // Not 429 anymore
    // }, 125000); // Increase test timeout to 125 seconds
  });

  // describe("API", () => {
  //   test("100 success, 101st fail", async () => {
  //     const file = await request(app)
  //       .post(`/files/upload`)
  //       .set("Authorization", `Bearer ${authToken}`)
  //       .field("name", "testFileFolder3")
  //       .attach("image", Buffer.alloc(1000, "a"), "testFileFolder3.jpg");
  //     const fileId = file.body.file.id;

  //     // 100 requests
  //     for (let i = 0; i < 100; i++) {
  //       const response = await request(app)
  //         .get(`/files/${fileId}/download`)
  //         .set("Authorization", `Bearer ${authToken}`);
  //       expect(response.status).toBe(200);
  //     }

  //     // 101st request should be rate limited
  //     const response = await request(app)
  //       .get(`/files/${fileId}/download`)
  //       .set("Authorization", `Bearer ${authToken}`);
  //     expect(response.status).toBe(429);
  //   });
  // });
});
