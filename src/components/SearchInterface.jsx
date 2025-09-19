import { useState } from "react";
import { searchItems, aiEnhancedSearch } from "../services/apiService";

const SearchInterface = ({ onResults, onLoading, onError }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("keyword");
  const [collection, setCollection] = useState("auction_items");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      onError("Please enter a search term");
      return;
    }

    onError(null);
    onLoading(true);

    try {
      let results;

      if (searchType === "ai") {
        results = await aiEnhancedSearch(collection, searchTerm);
      } else {
        results = await searchItems(collection, searchTerm);
      }

      onResults(results);
    } catch (error) {
      onError(error.message);
      onResults([]);
    } finally {
      onLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    onResults([]);
    onError(null);
  };

  return (
    <div className="search-interface">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter search term (e.g., 'iPhone', 'gaming console', or 'devices under $500')"
            className="search-input"
          />

          <select
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className="collection-select"
          >
            <option value="auction_items">Auction Items</option>
            <option value="users">Users</option>
            <option value="orders">Orders</option>
          </select>
        </div>

        <div className="search-options">
          <label className="search-type-option">
            <input
              type="radio"
              value="keyword"
              checked={searchType === "keyword"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            Keyword Search
          </label>

          <label className="search-type-option">
            <input
              type="radio"
              value="ai"
              checked={searchType === "ai"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            AI-Enhanced Search
          </label>
        </div>

        <div className="search-buttons">
          <button type="submit" className="search-btn primary">
            🔍 Search
          </button>
          <button type="button" onClick={handleClear} className="search-btn secondary">
            🗑️ Clear
          </button>
        </div>
      </form>

      <div className="search-help">
        <p>
          <strong>Keyword Search:</strong> Searches in title and description fields
        </p>
        <p>
          <strong>AI Search:</strong> Use natural language like "cheap gaming devices" or "Apple
          products over $800"
        </p>
      </div>
    </div>
  );
};

export default SearchInterface;
