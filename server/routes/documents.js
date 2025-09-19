import { Router } from "express";
import database from "../../../mongo-cli-tool/src/utils/database.js";
import logger from "../../../mongo-cli-tool/src/utils/logger.js";

const router = Router();

// Count documents endpoint - returns number of documents matching query
router.post("/count", async (req, res) => {
  try {
    const { collection, query = {} } = req.body;

    logger.header(`🧮 Counting documents in: ${collection}`);
    logger.info(`📋 Query: ${JSON.stringify(query)}`);

    if (!collection) {
      logger.error("⚠️ Collection name is required");
      return res.status(400).json({
        error: "Collection name is required",
      });
    }

    const connected = await database.connect();
    if (!connected) {
      logger.error("❌ Failed to connect to database");
      return res.status(500).json({
        error: "Failed to connect to database",
      });
    }

    logger.info("✅ Connected to database successfully");

    // Use MongoDB's efficient countDocuments method
    const Model = database.getModel(collection);
    const count = await Model.countDocuments(query);

    logger.success(`📊 Document count: ${count}`);

    await database.disconnect();
    logger.info("🔌 Database connection closed");

    res.json({
      count,
      collection,
      query,
    });
  } catch (error) {
    logger.error("💥 Count endpoint error: " + error.message);
    res.status(500).json({
      error: "Count failed",
      message: error.message,
    });
  }
});

// Add documents endpoint - inserts new documents into collections
router.post("/add", async (req, res) => {
  try {
    const { collection, data } = req.body;

    logger.header(`➕ Adding documents to: ${collection}`);
    logger.info(`📄 Data type: ${Array.isArray(data) ? "Array" : "Single object"}`);
    logger.info(`📊 Document count: ${Array.isArray(data) ? data.length : 1}`);

    if (!collection || !data) {
      logger.error("⚠️ Collection name and data are required");
      return res.status(400).json({
        error: "Collection name and data are required",
      });
    }

    const connected = await database.connect();
    if (!connected) {
      logger.error("❌ Failed to connect to database");
      return res.status(500).json({
        error: "Failed to connect to database",
      });
    }

    logger.info("✅ Connected to database successfully");

    const Model = database.getModel(collection);
    let result;

    // Handle both single documents and arrays of documents
    if (Array.isArray(data)) {
      logger.info("📦 Performing bulk insert");
      result = await Model.insertMany(data);
      logger.success(`🎉 Successfully inserted ${result.length} documents`);
    } else {
      logger.info("📝 Inserting single document");
      const document = new Model(data);
      result = await document.save();
      logger.success(`🎉 Successfully inserted document with ID: ${result._id}`);
    }

    await database.disconnect();
    logger.info("🔌 Database connection closed");

    res.json({
      success: true,
      inserted: Array.isArray(result) ? result.length : 1,
      data: result,
    });
  } catch (error) {
    logger.error("💥 Add endpoint error: " + error.message);
    res.status(500).json({
      error: "Failed to add documents",
      message: error.message,
    });
  }
});

export default router;
