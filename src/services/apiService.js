import logger from "../../../mongo-cli-tool/src/utils/logger.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Basic keyword search function
export const searchItems = async (collection, searchTerm) => {
  try {
    // Create a MongoDB query for text search
    const query = {
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
    };

    logger.info(`🔍 Sending search request with query: ${JSON.stringify(query)}`);

    const response = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection,
        query, // Send as object, not string
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Search error:", error);
    throw new Error(`Failed to search items: ${error.message}`);
  }
};

// AI-enhanced search function
export const aiEnhancedSearch = async (collection, naturalLanguageQuery) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection,
        query: naturalLanguageQuery, // Send as string for AI processing
      }),
    });

    if (!response.ok) {
      throw new Error(`AI search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("AI search error:", error);
    // Fallback to regular search if AI search fails
    console.log("Falling back to keyword search...");
    return await searchItems(collection, naturalLanguageQuery);
  }
};

// Get all collections
export const getCollections = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/collections`);

    if (!response.ok) {
      throw new Error(`Failed to get collections: ${response.statusText}`);
    }

    const data = await response.json();
    return data.collections || [];
  } catch (error) {
    console.error("Get collections error:", error);
    throw new Error(`Failed to get collections: ${error.message}`);
  }
};
