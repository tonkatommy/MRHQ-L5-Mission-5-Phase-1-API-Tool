import { Router } from "express";
import database from "../../../mongo-cli-tool/src/utils/database.js";
import logger from "../../../mongo-cli-tool/src/utils/logger.js";

const router = Router();

// Get all collections endpoint - returns list of MongoDB collections
// Used by frontend to populate collection dropdown
router.get("/", async (req, res) => {
  try {
    logger.header("📚 Retrieving MongoDB Collections");

    // Connect to MongoDB using the CLI tool's database utility
    const connected = await database.connect();
    if (!connected) {
      logger.error("❌ Failed to connect to database");
      return res.status(500).json({
        error: "Failed to connect to database",
      });
    }

    logger.info("✅ Successfully connected to MongoDB");

    // Retrieve all collections from the connected database
    const collections = await database.mongoose.connection.db.listCollections().toArray();

    logger.success(`🎯 Found ${collections.length} collections`);
    logger.data(collections.map((col) => col.name));

    // Always disconnect after operation to prevent connection leaks
    await database.disconnect();
    logger.info("🔌 Database connection closed");

    // Return collection names and count to frontend
    res.json({
      collections: collections.map((col) => col.name),
      count: collections.length,
    });
  } catch (error) {
    logger.error("💥 Collections endpoint error: " + error.message);
    res.status(500).json({
      error: "Failed to retrieve collections",
      message: error.message,
    });
  }
});

export default router;
