import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MangaCard from './MangaCard';
import FilterBar from './FilterBar';

function MangaList() {
    const navigate = useNavigate();
    const [mangaData, setMangaData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('latest');
    const [filters, setFilters] = useState({
        genres: [],
        status: 'all'
    });
    const [totalPages, setTotalPages] = useState(1);

    // Function to determine the order parameter based on sortBy state
    const getOrderParam = () => {
        switch(sortBy) {
            case 'rating':
                return 'rating';
            case 'popularity':
                return 'followedCount';
            case 'alphabetical':
                return 'title';
            case 'latest':
            default:
                return 'latestUploadedChapter';
        }
    };

    // Function to handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    // Function to handle sort method changes
    const handleSortChange = (sortMethod) => {
        setSortBy(sortMethod);
        setCurrentPage(1);
    };

    // Manual retry handler
    const handleRetry = () => {
        setError(null);
        fetchManga();
    };

    // Function to fetch manga data - FIXED VERSION
    const fetchManga = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Calculate offset based on currentPage
            const offset = (currentPage - 1) * 20;
            const orderParam = getOrderParam();
            const orderDirection = sortBy === 'alphabetical' ? 'asc' : 'desc';
            
            // FIXED: Use correct MangaDex API URL
            const baseUrl = 'https://api.mangadex.org';
            let apiUrl = `${baseUrl}/manga?limit=20&offset=${offset}&contentRating[]=safe&hasAvailableChapters=true&order[${orderParam}]=${orderDirection}&includes[]=cover_art&includes[]=author`;
            
            // Add genre filters
            if (filters.genres && filters.genres.length > 0) {
                filters.genres.forEach(genre => {
                    apiUrl += `&includedTags[]=${encodeURIComponent(genre)}`;
                });
            }
            
            // Add status filter
            if (filters.status && filters.status !== 'all') {
                apiUrl += `&status[]=${encodeURIComponent(filters.status)}`;
            }
            
            console.log('Fetching from URL:', apiUrl);
            console.log('Current page:', currentPage);
            
            // Try fetch with timeout and better error handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'eManga/1.0'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.data || !Array.isArray(data.data)) {
                throw new Error('Invalid data format received from API');
            }
            
            // Set total pages
            const total = data.total || 1000;
            const calculatedTotalPages = Math.ceil(total / 20);
            setTotalPages(Math.min(calculatedTotalPages, 50));
            
            // Process manga data
            const processedData = data.data.map(manga => {
                // Find cover art filename
                let coverFilename = null;
                const coverArt = manga.relationships.find(rel => rel.type === "cover_art");
                if (coverArt && coverArt.attributes && coverArt.attributes.fileName) {
                    coverFilename = coverArt.attributes.fileName;
                }
                
                // Find author name
                let author = "Unknown Author";
                const authorRel = manga.relationships.find(rel => rel.type === "author");
                if (authorRel && authorRel.attributes && authorRel.attributes.name) {
                    author = authorRel.attributes.name;
                }
                
                // Get genres
                const genres = manga.attributes.tags && Array.isArray(manga.attributes.tags)
                    ? manga.attributes.tags
                        .filter(tag => tag.attributes && tag.attributes.group === "genre")
                        .map(tag => {
                            if (tag.attributes && tag.attributes.name) {
                                return tag.attributes.name.en || 
                                       Object.values(tag.attributes.name)[0] || 
                                       "Genre";
                            }
                            return "Genre";
                        })
                        .filter(Boolean)
                    : ["Manga"];
                
                const genreString = genres.length > 0 
                    ? genres.slice(0, 3).join(', ')
                    : "Manga";
                
                // Handle title
                const titleObj = manga.attributes.title || {};
                const title = titleObj.en || 
                             (Object.values(titleObj).length > 0 ? Object.values(titleObj)[0] : "Untitled");

                // Handle description
                const descObj = manga.attributes.description || {};
                const description = descObj.en || 
                                  (Object.values(descObj).length > 0 ? Object.values(descObj)[0] : "No description available.");
                
                return {
                    id: manga.id,
                    title: title,
                    cover: coverFilename ? 
                        `https://uploads.mangadex.org/covers/${manga.id}/${coverFilename}.256.jpg` : 
                        "https://via.placeholder.com/256x384.png?text=No+Cover",
                    author: author,
                    genre: genreString,
                    genres: genres,
                    description: description
                };
            });
            
            setMangaData(processedData);
            setIsLoading(false);
            
        } catch (error) {
            console.error('Error fetching manga:', error);
            
            // Better error messages
            let errorMessage = 'Failed to load manga';
            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out. Please check your internet connection.';
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection or try again later.';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'CORS error. The API might be blocking requests from this domain.';
            } else {
                errorMessage = `${errorMessage}: ${error.message}`;
            }
            
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    // UseEffect to trigger fetch - FIXED dependency array
    useEffect(() => {
        fetchManga();
    }, [currentPage, sortBy, filters]); // This should trigger when page changes

    // FIXED pagination function - better logic
    const getPaginationItems = () => {
        const items = [];
        const maxPagesToShow = 5;
        
        // Handle case when totalPages is 1 or less
        if (totalPages <= 1) {
            return items;
        }
        
        // Always show first page
        items.push(
            <li key={1} className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
            </li>
        );
        
        if (totalPages > 1) {
            let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);
            
            // Adjust if we don't have enough pages to show
            if (endPage - startPage < maxPagesToShow - 3) {
                startPage = Math.max(2, endPage - (maxPagesToShow - 3));
            }
            
            // Show ellipsis if there's a gap
            if (startPage > 2) {
                items.push(
                    <li key="ellipsis1" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
            
            // Show middle pages
            for (let i = startPage; i <= endPage; i++) {
                items.push(
                    <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
                    </li>
                );
            }
            
            // Show ellipsis if there's a gap
            if (endPage < totalPages - 1) {
                items.push(
                    <li key="ellipsis2" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
            
            // Always show last page if totalPages > 1
            if (totalPages > 1) {
                items.push(
                    <li key={totalPages} className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                    </li>
                );
            }
        }
        
        return items;
    };

    // NEW: Handle page change function
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
            // Scroll to top when page changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="container">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="fw-bold text-primary mb-0">Manga Collection</h2>
                        <div className="btn-group" role="group">
                            <button 
                                type="button" 
                                className={`btn btn-outline-primary ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <i className="bi bi-grid-3x3-gap-fill"></i>
                            </button>
                            <button 
                                type="button" 
                                className={`btn btn-outline-primary ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <i className="bi bi-list"></i>
                            </button>
                        </div>
                    </div>
                    
                    <FilterBar 
                        onFilterChange={handleFilterChange} 
                        onSortChange={handleSortChange}
                        sortBy={sortBy}
                    />
                </div>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="row justify-content-center my-5 py-5">
                    <div className="col-auto text-center">
                        <div className="spinner-border text-primary" role="status" style={{width: "3rem", height: "3rem"}}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-3 text-center text-secondary">
                            Loading manga collection... (Page {currentPage})
                        </div>
                    </div>
                </div>
            )}
            
            {/* Error state */}
            {error && !isLoading && (
                <div className="alert alert-danger d-flex flex-column" role="alert">
                    <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2 fs-3"></i>
                        <div>
                            <h5 className="mt-0 mb-1">Error Loading Manga</h5>
                            <p className="mb-0">{error}</p>
                            <small className="text-muted">Page: {currentPage}</small>
                        </div>
                    </div>
                    <button 
                        className="btn btn-danger align-self-center"
                        onClick={handleRetry}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>Try Again
                    </button>
                </div>
            )}
            
            {/* No data state */}
            {!isLoading && mangaData.length === 0 && !error && (
                <div className="alert alert-info d-flex align-items-center" role="alert">
                    <i className="bi bi-info-circle-fill flex-shrink-0 me-2"></i>
                    <div>
                        No manga found on page {currentPage}. 
                        {currentPage > 1 && (
                            <>
                                <br />
                                <button 
                                    className="btn btn-link p-0 mt-2" 
                                    onClick={() => handlePageChange(1)}
                                >
                                    Go back to page 1
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {!isLoading && mangaData.map((manga) => (
                        <div className="col mb-3" key={manga.id}>
                            <MangaCard manga={manga} />
                        </div>
                    ))}
                </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
                <div className="row">
                    {!isLoading && mangaData.map((manga) => (
                        <div className="col-12 mb-3" key={manga.id}>
                            <div className="card shadow-sm">
                                <div className="row g-0">
                                    <div className="col-md-2">
                                        <img 
                                            src={manga.cover} 
                                            alt={manga.title}
                                            className="img-fluid rounded-start" 
                                            style={{maxHeight: "200px", objectFit: "cover", width: "100%"}}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/256x384.png?text=No+Cover";
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-10">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h5 className="card-title">{manga.title}</h5>
                                                    <p className="card-text text-muted mb-2">
                                                        <i className="bi bi-person-fill me-1"></i> {manga.author}
                                                    </p>
                                                    <p className="card-text">
                                                        {manga.genres && manga.genres.slice(0, 3).map((genre, index) => (
                                                            <span key={index} className="badge bg-secondary me-2 mb-1">{genre}</span>
                                                        ))}
                                                        {(!manga.genres || manga.genres.length === 0) && (
                                                            <span className="badge bg-secondary me-2 mb-1">Manga</span>
                                                        )}
                                                    </p>
                                                    <p className="card-text">
                                                        {manga.description.length > 200 
                                                            ? manga.description.substring(0, 200) + '...' 
                                                            : manga.description}
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <div className="mb-3">
                                                        <span className="badge bg-primary rounded-pill d-inline-flex align-items-center">
                                                            <i className="bi bi-star-fill me-1"></i>
                                                            9.2
                                                        </span>
                                                    </div>
                                                    <button 
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => navigate(`/manga/${manga.id}`,{state: {manga}})}
                                                    >
                                                        <i className="bi bi-book me-1"></i> Read Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* IMPROVED Pagination */}
            {!isLoading && mangaData.length > 0 && totalPages > 1 && (
                <div className="row mt-4 mb-5">
                    <div className="col-12">
                        <nav aria-label="Manga navigation">
                            <ul className="pagination justify-content-center">
                                {/* Previous button */}
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link" 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        aria-disabled={currentPage === 1}
                                    >
                                        <i className="bi bi-chevron-left"></i> Prev
                                    </button>
                                </li>
                                
                                {/* Page numbers */}
                                {getPaginationItems()}
                                
                                {/* Next button */}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link" 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        aria-disabled={currentPage === totalPages}
                                    >
                                        Next <i className="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    
                    {/* Page info */}
                    <div className="col-12 text-center mt-2">
                        <small className="text-muted">
                            Showing page {currentPage} of {totalPages} 
                            {mangaData.length > 0 && ` (${mangaData.length} manga on this page)`}
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MangaList;