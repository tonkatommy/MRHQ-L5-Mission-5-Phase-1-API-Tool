const SearchResults = ({ results, isLoading }) => {
  if (isLoading) {
    return null;
  }

  if (!results || results.length === 0) {
    return (
      <div className="search-results">
        <p className="no-results">No items found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <h2>Search Results ({results.length} items)</h2>
      </div>

      <div className="results-grid">
        {results.map((item, index) => (
          <div key={item._id || index} className="result-item">
            <div className="item-header">
              <h3 className="item-title">{item.title}</h3>
              <span className="item-id">ID: {item._id}</span>
            </div>

            <p className="item-description">{item.description}</p>

            <div className="item-prices">
              <div className="price-info">
                <span className="price-label">Start Price:</span>
                <span className="price-value">${item.start_price}</span>
              </div>
              <div className="price-info">
                <span className="price-label">Reserve Price:</span>
                <span className="price-value">${item.reserve_price}</span>
              </div>
            </div>

            {item.category && (
              <div className="item-category">
                <span className="category-label">Category:</span>
                <span className="category-value">{item.category}</span>
              </div>
            )}

            {item.createdAt && (
              <div className="item-date">
                <span className="date-label">Created:</span>
                <span className="date-value">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
