const val = require("../middleware/validation");

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

  describe("New Username", () => {
    const runValidation = async (newName) => {
      const req = { body: { newName } };
      const res = {};
      let error;
      const next = (err) => {
        error = err;
      };

      for (const validator of val.validateNewUsername) {
        await validator(req, res, next);
      }

      return error;
    };

    test("valid username passes", async () => {
      const error = await runValidation("newUsername123");
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
      const error = await runValidation("new user!");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(
        "Username can only contain letters, numbers, underscores, hyphens, and periods"
      );
    });

    test("username with valid special characters passes", async () => {
      const error = await runValidation("user_name-123.test");
      expect(error).toBeUndefined();
    });
  });

  describe("New File Name", () => {
    const runValidation = async (displayName) => {
      const req = { body: { displayName } };
      const res = {};
      let error;
      const next = (err) => {
        error = err;
      };

      for (const validator of val.validateFileName) {
        await validator(req, res, next);
      }

      return error;
    };

    test("valid filename passes", async () => {
      const error = await runValidation("document123");
      expect(error).toBeUndefined();
    });

    test("empty filename fails", async () => {
      const error = await runValidation("");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Filename is required");
    });

    test("filename too long fails", async () => {
      const error = await runValidation("a".repeat(21));
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(
        "Filename must be between 1 and 20 characters"
      );
    });

    test("filename with invalid characters fails", async () => {
      const error = await runValidation("my file!");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(
        "Filename can only contain letters, numbers, underscores, hyphens, and periods"
      );
    });

    test("filename with valid special characters passes", async () => {
      const error = await runValidation("file_name-123.txt");
      expect(error).toBeUndefined();
    });
  });

  describe("New Folder Name", () => {
    const runValidation = async (displayName) => {
      const req = { body: { displayName } };
      const res = {};
      let error;
      const next = (err) => {
        error = err;
      };

      for (const validator of val.validateFolderName) {
        await validator(req, res, next);
      }

      return error;
    };

    test("valid folder name passes", async () => {
      const error = await runValidation("myFolder123");
      expect(error).toBeUndefined();
    });

    test("empty folder name fails", async () => {
      const error = await runValidation("");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Folder name is required");
    });

    test("folder name too long fails", async () => {
      const error = await runValidation("a".repeat(21));
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(
        "Folder name must be between 1 and 20 characters"
      );
    });

    test("folder name with invalid characters fails", async () => {
      const error = await runValidation("my folder!");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(
        "Folder name can only contain letters, numbers, underscores, hyphens, and periods"
      );
    });

    test("folder name with valid special characters passes", async () => {
      const error = await runValidation("folder_name-123.");
      expect(error).toBeUndefined();
    });
  });
});
