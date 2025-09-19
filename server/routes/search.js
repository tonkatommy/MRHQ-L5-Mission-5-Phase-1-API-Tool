import { Router } from "express";
import database from "../../../mongo-cli-tool/src/utils/database.js";
import logger from "../../../mongo-cli-tool/src/utils/logger.js";
import { convertNaturalLanguageToQuery } from "../utils/aiProcessor.js";

const router = Router();

// Basic search endpoint - performs keyword-based search on MongoDB collections
// Accepts MongoDB query objects for flexible searching
router.post("/", async (req, res) => {
  try {
    // Extract search parameters from request body
    const { collection, query, limit = 10 } = req.body;

    logger.header(`🔍 Searching collection: ${collection}`);
    logger.info(`📋 Query: ${JSON.stringify(query)}`);
    logger.info(`🎯 Limit: ${limit}`);

    // Validate required parameters
    if (!collection) {
      logger.error("⚠️ Collection name is required");
      return res.status(400).json({
        error: "Collection name is required",
      });
    }

    // Connect to database
    const connected = await database.connect();
    if (!connected) {
      logger.error("❌ Failed to connect to database");
      return res.status(500).json({
        error: "Failed to connect to database",
      });
    }

    logger.info("✅ Connected to database successfully");

    // Get Mongoose model for the specified collection
    const Model = database.getModel(collection);
    logger.info(`🏗️ Using model for collection: ${collection}`);

    // Execute the search query with limit for performance
    const results = await Model.find(query || {}).limit(parseInt(limit));

    logger.success(`📊 Found ${results.length} documents`);

    // Clean up database connection
    await database.disconnect();
    logger.info("🔌 Database connection closed");

    // Return search results with metadata
    res.json({
      results,
      count: results.length,
      collection,
      query: query || {},
    });
  } catch (error) {
    logger.error("💥 Search endpoint error: " + error.message);
    res.status(500).json({
      error: "Search failed",
      message: error.message,
    });
  }
});

// AI-enhanced search endpoint - converts natural language to MongoDB queries
router.post("/ai", async (req, res) => {
  try {
    // Extract parameters - natural language query instead of MongoDB syntax
    const { collection, query: naturalLanguageQuery, limit = 10 } = req.body;

    logger.header(`🤖 AI-Enhanced Search: ${collection}`);
    logger.info(`💬 Natural language query: "${naturalLanguageQuery}"`);
    logger.info(`🎯 Limit: ${limit}`);

    // Validate required parameters
    if (!collection || !naturalLanguageQuery) {
      logger.error("⚠️ Collection name and query are required");
      return res.status(400).json({
        error: "Collection name and query are required",
      });
    }

    // Connect to database
    const connected = await database.connect();
    if (!connected) {
      logger.error("❌ Failed to connect to database");
      return res.status(500).json({
        error: "Failed to connect to database",
      });
    }

    logger.info("✅ Connected to database successfully");

    // Convert natural language to MongoDB query using our AI function
    const mongoQuery = await convertNaturalLanguageToQuery(naturalLanguageQuery);
    logger.info("🔄 Converted to MongoDB query:");
    logger.data(mongoQuery);

    // Execute the converted query
    const Model = database.getModel(collection);
    const results = await Model.find(mongoQuery).limit(parseInt(limit));

    logger.success(`🎉 AI search found ${results.length} documents`);

    await database.disconnect();
    logger.info("🔌 Database connection closed");

    // Return results with both original and converted queries for transparency
    res.json({
      results,
      count: results.length,
      collection,
      originalQuery: naturalLanguageQuery,
      mongoQuery,
    });
  } catch (error) {
    logger.error("💥 AI search endpoint error: " + error.message);

    // Fallback mechanism - if AI search fails, try basic keyword search
    try {
      logger.warning("🔄 AI search failed, attempting fallback keyword search");

      const fallbackQuery = {
        $or: [
          { title: { $regex: req.body.query, $options: "i" } },
          { description: { $regex: req.body.query, $options: "i" } },
        ],
      };

      logger.info("🔄 Fallback query:");
      logger.data(fallbackQuery);

      const connected = await database.connect();
      if (!connected) {
        logger.error("❌ Failed to connect to database for fallback");
        return res.status(500).json({
          error: "Failed to connect to database",
        });
      }

      const Model = database.getModel(req.body.collection);
      const results = await Model.find(fallbackQuery).limit(parseInt(req.body.limit || 10));

      logger.info(`🔄 Fallback search found ${results.length} documents`);

      await database.disconnect();
      logger.info("🔌 Database connection closed");

      res.json({
        results,
        count: results.length,
        collection: req.body.collection,
        fallback: true,
        message: "AI search failed, using keyword search",
      });
    } catch (fallbackError) {
      logger.error("💥 Fallback search also failed: " + fallbackError.message);
      res.status(500).json({
        error: "Both AI and fallback search failed",
        message: fallbackError.message,
      });
    }
  }
});

export default router;
