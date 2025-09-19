import { useState, useEffect } from "react";
import SearchInterface from "./components/SearchInterface";
import SearchResults from "./components/SearchResults";
import "./App.css";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(prefersDark);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleLoading = (loading) => {
    setIsLoading(loading);
  };

  const handleError = (error) => {
    setError(error);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="app-container">
      {/* Theme Toggle Switch */}
      <div className="theme-toggle">
        <span className="theme-toggle-label">{darkMode ? "🌙" : "☀️"}</span>
        <label className="toggle-switch">
          <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
          <span className="toggle-slider"></span>
        </label>
        <span className="theme-toggle-label">{darkMode ? "Dark" : "Light"}</span>
      </div>

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
