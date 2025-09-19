import { Router } from "express";
import logger from "../../../mongo-cli-tool/src/utils/logger.js";

const router = Router();

// Health check endpoint - used to verify server is running
// Returns server status and timestamp
router.get("/", (req, res) => {
  logger.info("🩺 Health check endpoint accessed");
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "MongoDB API Server",
  });
});

export default router;
