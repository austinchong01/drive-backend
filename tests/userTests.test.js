const request = require("supertest");
const express = require("express");
const userRouter = require("../routes/userRouter");

const app = express();
app.use(express.json());
app.use("/", userRouter);

describe("POST /auth/register", () => {
    test("should respond with 201 status code and token", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                email: "test@example.com",
                password: "password123"
            });
        
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("token");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user.username).toBe("testuser");
        expect(response.body.user.email).toBe("test@example.com");
        expect(response.body.user.password).toBeUndefined();
    });

    test("should reject invalid data", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "test"
                // missing email and password
            });
        expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
});