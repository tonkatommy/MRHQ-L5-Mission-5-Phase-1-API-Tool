// MongoDB API Server - Express.js backend for the MongoDB CLI Tool frontend
// This server provides REST API endpoints to interact with MongoDB collections
// and integrates with the existing MongoDB CLI utilities from Phase 1

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import MongoDB CLI utilities from the Phase 1 CLI tool
import database from "../../mongo-cli-tool/src/utils/database.js";
import logger from "../../mongo-cli-tool/src/utils/logger.js";

// Import route modules
import apiRoutes from "./routes/index.js";

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve("../../.env") });

// Initialize Express application and set default port
const app = express();
const PORT = process.env.PORT || 3001;

// Get current directory for ES modules (needed for file path resolution)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Configure CORS to allow requests from the React frontend
// This enables the frontend (running on port 5173) to make API calls to this server
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow frontend URL
    credentials: true, // Allow cookies and auth headers
  })
);

// Parse JSON request bodies - required for POST requests with JSON data
app.use(express.json());

// Custom logging middleware to track all incoming requests
// Logs timestamp, HTTP method, and request path for debugging
app.use((req, res, next) => {
  logger.info(`📥 Incoming request: ${req.method} ${req.path}`);
  logger.info(`📄 Request body: ${JSON.stringify(req.body, null, 2)}`);
  next();
});

// ============================================================================
// API ROUTES
// ============================================================================

// Mount all API routes under /api prefix
app.use("/api", apiRoutes);

// ============================================================================
// ERROR HANDLING AND SERVER SETUP
// ============================================================================

// Global error handling middleware - catches any unhandled errors
app.use((error, req, res, next) => {
  logger.error("💥 Unhandled error: " + error.message);
  logger.error("🔍 Stack trace: " + error.stack);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  logger.warning(`🚫 404 - Endpoint not found: ${req.originalUrl}`);
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Start the Express server
app.listen(PORT, () => {
  logger.success(`🚀 MongoDB API Server started successfully`);
  logger.info(`🌐 Port: ${PORT}`);
  logger.info(`🩺 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`🔍 Search endpoint: http://localhost:${PORT}/api/search`);
  logger.info(`🤖 AI Search endpoint: http://localhost:${PORT}/api/search/ai`);
  logger.separator();
});

// ============================================================================
// GRACEFUL SHUTDOWN HANDLING
// ============================================================================
// Ensure database connections are properly closed when server shuts down

// Handle SIGTERM signal (usually from process managers like PM2)
process.on("SIGTERM", async () => {
  logger.warning("🛑 SIGTERM received, shutting down gracefully");
  await database.disconnect();
  logger.info("🔌 Database connections closed");
  process.exit(0);
});

// Handle SIGINT signal (Ctrl+C in terminal)
process.on("SIGINT", async () => {
  logger.warning("🛑 SIGINT received, shutting down gracefully");
  await database.disconnect();
  logger.info("🔌 Database connections closed");
  process.exit(0);
});
