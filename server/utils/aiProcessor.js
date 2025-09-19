import logger from "../../../mongo-cli-tool/src/utils/logger.js";

/**
 * Converts natural language queries to MongoDB query objects
 * This function implements a rule-based approach to translate human-readable
 * search terms into MongoDB query syntax
 *
 * @param {string} naturalQuery - Natural language search string
 * @returns {Object} - MongoDB query object
 *
 * Examples:
 * - "iPhone under $500" → { $and: [{ start_price: { $lt: 500 } }, { $or: [{ title: /iphone/i }, { description: /iphone/i }] }] }
 * - "gaming console" → { $or: [{ title: /gaming/i }, { description: /gaming/i }, { title: /console/i }, { description: /console/i }] }
 */
export async function convertNaturalLanguageToQuery(naturalQuery) {
  logger.info(`🔄 Converting natural language query: "${naturalQuery}"`);

  const query = naturalQuery.toLowerCase();
  let mongoQuery = {};

  // ========================================================================
  // PRICE RANGE PROCESSING
  // ========================================================================
  logger.info("💰 Processing price patterns...");

  // Define patterns for common price expressions and their MongoDB equivalents
  const pricePatterns = {
    under: (match) => ({ start_price: { $lt: parseInt(match[1]) } }),
    over: (match) => ({ start_price: { $gt: parseInt(match[1]) } }),
    above: (match) => ({ start_price: { $gt: parseInt(match[1]) } }),
    below: (match) => ({ start_price: { $lt: parseInt(match[1]) } }),
    "less than": (match) => ({ start_price: { $lt: parseInt(match[1]) } }),
    "more than": (match) => ({ start_price: { $gt: parseInt(match[1]) } }),
    between: (match) => ({
      start_price: {
        $gte: parseInt(match[1]),
        $lte: parseInt(match[2]),
      },
    }),
  };

  // Process price patterns - check each pattern against the query
  for (const [pattern, handler] of Object.entries(pricePatterns)) {
    if (pattern === "between") {
      const match = query.match(/between\s+\$?(\d+)\s+and\s+\$?(\d+)/);
      if (match) {
        Object.assign(mongoQuery, handler(match));
        logger.info(`💵 Found price range: between $${match[1]} and $${match[2]}`);
        break;
      }
    } else {
      const match = query.match(new RegExp(`${pattern}\\s+\\$?(\\d+)`));
      if (match) {
        Object.assign(mongoQuery, handler(match));
        logger.info(`💵 Found price filter: ${pattern} $${match[1]}`);
        break;
      }
    }
  }

  // ========================================================================
  // KEYWORD AND BRAND PROCESSING
  // ========================================================================
  logger.info("🏷️ Processing keyword and brand patterns...");

  const brandKeywords = [
    "apple",
    "samsung",
    "sony",
    "nintendo",
    "microsoft",
    "dell",
    "hp",
    "lenovo",
  ];

  const categoryKeywords = {
    phone: ["phone", "iphone", "smartphone"],
    laptop: ["laptop", "notebook", "macbook"],
    gaming: ["gaming", "console", "nintendo", "playstation", "xbox"],
    audio: ["headphones", "speaker", "audio", "sound"],
    camera: ["camera", "photo", "video"],
  };

  const textConditions = [];
  const foundKeywords = [];

  // Check for brand keywords in the query
  for (const brand of brandKeywords) {
    if (query.includes(brand)) {
      foundKeywords.push(`brand: ${brand}`);
      textConditions.push(
        { title: { $regex: brand, $options: "i" } },
        { description: { $regex: brand, $options: "i" } }
      );
    }
  }

  // Check for category keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        foundKeywords.push(`category: ${category} (${keyword})`);
        textConditions.push(
          { title: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } }
        );
      }
    }
  }

  if (foundKeywords.length > 0) {
    logger.info(`🎯 Found keywords: ${foundKeywords.join(", ")}`);
  }

  // If no specific brand/category found, do general word-based search
  if (textConditions.length === 0) {
    logger.info("🔍 No specific keywords found, performing general word search");

    const words = query
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(
        (word) =>
          ![
            "under",
            "over",
            "above",
            "below",
            "between",
            "and",
            "the",
            "a",
            "an",
            "is",
            "are",
          ].includes(word)
      );

    logger.info(`📝 Extracted words for search: ${words.join(", ")}`);

    for (const word of words) {
      if (word.length > 2) {
        textConditions.push(
          { title: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } }
        );
      }
    }
  }

  // ========================================================================
  // QUERY COMBINATION
  // ========================================================================
  logger.info("🔗 Combining price and text conditions...");

  if (textConditions.length > 0) {
    if (Object.keys(mongoQuery).length > 0) {
      mongoQuery = {
        $and: [mongoQuery, { $or: textConditions }],
      };
      logger.info("🔀 Combined price and text conditions with $and operator");
    } else {
      mongoQuery = { $or: textConditions };
      logger.info("🔀 Using text conditions only with $or operator");
    }
  } else if (Object.keys(mongoQuery).length > 0) {
    logger.info("💰 Using price conditions only");
  } else {
    logger.warning("⚠️ No patterns matched - will return empty query (all documents)");
  }

  logger.info("✨ Final MongoDB query generated:");
  logger.data(mongoQuery);

  return Object.keys(mongoQuery).length > 0 ? mongoQuery : {};
}
