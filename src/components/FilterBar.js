import React, { useState, useEffect } from 'react';

function FilterBar({ onFilterChange, onSortChange, sortBy }) {
  const [genreFilters, setGenreFilters] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'hiatus', label: 'On Hiatus' },
  ];

  // Fetch available genres from MangaDx API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const apiUrl = "https://api.mangadex.org"; // FIXED URL
        const response = await fetch(`${apiUrl}/manga/tag`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }
        
        const data = await response.json();
        
        // Filter tags to only include genre group
        const genres = data.data
          .filter(tag => tag.attributes.group === 'genre')
          .map(tag => ({
            id: tag.id,
            name: tag.attributes.name.en || Object.values(tag.attributes.name)[0]
          }));
          
        setGenreFilters(genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
        // Set some default genres if API fails
        setGenreFilters([
          { id: 'action', name: 'Action' },
          { id: 'adventure', name: 'Adventure' },
          { id: 'comedy', name: 'Comedy' },
          { id: 'drama', name: 'Drama' },
          { id: 'fantasy', name: 'Fantasy' },
          { id: 'romance', name: 'Romance' },
          { id: 'sci-fi', name: 'Sci-Fi' },
          { id: 'slice-of-life', name: 'Slice of Life' }
        ]);
      }
    };
    
    fetchGenres();
  }, []);

  // Handle genre selection
  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prevSelected => {
      if (prevSelected.includes(genreId)) {
        const filtered = prevSelected.filter(id => id !== genreId);
        onFilterChange({ genres: filtered, status: statusFilter });
        return filtered;
      } else {
        const newSelected = [...prevSelected, genreId];
        onFilterChange({ genres: newSelected, status: statusFilter });
        return newSelected;
      }
    });
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    onFilterChange({ genres: selectedGenres, status });
  };

  // Handle sort method change
  const handleSortChange = (sortMethod) => {
    onSortChange(sortMethod);
  };

  return (
    <div className="filter-bar mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            <i className="bi bi-funnel me-2"></i>
            Filters {selectedGenres.length > 0 && `(${selectedGenres.length})`}
          </button>
        </div>
        
        <div className="d-flex align-items-center">
          <label className="me-2 text-muted">Sort by:</label>
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary dropdown-toggle" 
              type="button" 
              id="sortDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              {sortBy === 'latest' ? 'Latest' : 
               sortBy === 'rating' ? 'Rating' : 
               sortBy === 'popularity' ? 'Popularity' : 'Alphabetical'}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="sortDropdown">
              <li>
                <button 
                  className={`dropdown-item ${sortBy === 'latest' ? 'active' : ''}`}
                  onClick={() => handleSortChange('latest')}
                >
                  <i className="bi bi-clock me-2"></i>Latest
                </button>
              </li>
              <li>
                <button 
                  className={`dropdown-item ${sortBy === 'popularity' ? 'active' : ''}`}
                  onClick={() => handleSortChange('popularity')}
                >
                  <i className="bi bi-graph-up me-2"></i>Popularity
                </button>
              </li>
              <li>
                <button 
                  className={`dropdown-item ${sortBy === 'rating' ? 'active' : ''}`}
                  onClick={() => handleSortChange('rating')}
                >
                  <i className="bi bi-star me-2"></i>Rating
                </button>
              </li>
              <li>
                <button 
                  className={`dropdown-item ${sortBy === 'alphabetical' ? 'active' : ''}`}
                  onClick={() => handleSortChange('alphabetical')}
                >
                  <i className="bi bi-sort-alpha-down me-2"></i>Alphabetical
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {isFilterVisible && (
        <div className="filter-options card shadow-sm border-0 mb-4 p-3 animate__animated animate__fadeIn">
          <div className="row">
            <div className="col-md-9">
              <h6 className="fw-bold mb-3">Genres</h6>
              <div className="d-flex flex-wrap gap-2">
                {genreFilters.map(genre => (
                  <div 
                    key={genre.id} 
                    className={`badge rounded-pill py-2 px-3 ${
                      selectedGenres.includes(genre.id) 
                        ? 'bg-primary' 
                        : 'bg-light text-dark'
                    }`}
                    onClick={() => handleGenreToggle(genre.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {selectedGenres.includes(genre.id) && (
                      <i className="bi bi-check-lg me-1"></i>
                    )}
                    {genre.name}
                  </div>
                ))}
                {genreFilters.length === 0 && (
                  <div className="text-muted fst-italic">Loading genres...</div>
                )}
              </div>
              
              {selectedGenres.length > 0 && (
                <div className="mt-2">
                  <button 
                    className="btn btn-sm btn-link text-decoration-none p-0"
                    onClick={() => {
                      setSelectedGenres([]);
                      onFilterChange({ genres: [], status: statusFilter });
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear genre filters
                  </button>
                </div>
              )}
            </div>
            
            <div className="col-md-3 mt-3 mt-md-0">
              <h6 className="fw-bold mb-3">Status</h6>
              <div className="list-group list-group-flush">
                {statuses.map(status => (
                  <button
                    key={status.value}
                    type="button"
                    className={`list-group-item list-group-item-action ${
                      statusFilter === status.value ? 'active' : ''
                    }`}
                    onClick={() => handleStatusChange(status.value)}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
