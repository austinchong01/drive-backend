require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const prismaErrorHandler = require("./errors/prismaErrorHandler");
const multerErrorHandler = require("./errors/multerErrorHandler");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * server.js
 * Main application entry point - configures CORS, middleware,
 * health check, routes, start, and shutdown
 */

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Routes
app.use("/", require("./routes/userRouter"));
app.use("/files", require("./routes/fileRouter"));
app.use("/folders", require("./routes/folderRouter"));
app.use("/api", require("./routes/apiRouter"));

// error middleware
app.use((err, req, res, next) => {
  err = multerErrorHandler(err);
  err = prismaErrorHandler(err);

  if (!err.statusCode || err.statusCode >= 500) {
    // console.log("Status 500 Error", err.message);       // DEV
    return res.status(500).json({
      error: "InternalServerError",
      message: "Status 500: An unexpected error occurred", // FOR DEPLOYMENT
    });
  }

  // console.log(err.name, err.statusCode, err.message);     // DEV
  res.status(err.statusCode).json({
    error: err.name,
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
