import { useState } from "react";
import SearchInterface from "./components/SearchInterface";
import SearchResults from "./components/SearchResults";
import "./App.css";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleLoading = (loading) => {
    setIsLoading(loading);
  };

  const handleError = (error) => {
    setError(error);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>MongoDB Search Tool</h1>
        <p>Search auction items with keyword or AI-enhanced queries</p>
      </header>

      <main className="app-main">
        <SearchInterface
          onResults={handleSearchResults}
          onLoading={handleLoading}
          onError={handleError}
        />

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        {isLoading && (
          <div className="loading-spinner">
            <p>Searching...</p>
          </div>
        )}

        <SearchResults results={searchResults} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default App;
