import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState(null);
    const [popularSearches] = useState([
        'Naruto', 'One Piece', 'Dragon Ball', 'Attack on Titan', 'Death Note'
    ]);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const apiUrl = "https://api.mangadex.org";

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
                setSelectedIndex(-1);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchRef]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showResults) return;

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev < searchResults.length + popularSearches.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev > 0 ? prev - 1 : searchResults.length + popularSearches.length - 1
                    );
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0) {
                        if (selectedIndex < searchResults.length) {
                            handleSelectManga(searchResults[selectedIndex]);
                        } else {
                            const popularIndex = selectedIndex - searchResults.length;
                            handlePopularClick(popularSearches[popularIndex]);
                        }
                    }
                    break;
                case 'Escape':
                    setShowResults(false);
                    setSelectedIndex(-1);
                    break;
                default:
                    break;
            }
        };

        if (showResults) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [showResults, selectedIndex, searchResults, popularSearches]);

    // Debounce search to avoid too many API calls
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            searchManga(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Function to fetch manga by title
    const searchManga = async (query) => {
        if (!query || query.trim() === '') return;

        setIsSearching(true);
        setError(null);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(
                `${apiUrl}/manga?title=${encodeURIComponent(query)}&limit=6&contentRating[]=safe&hasAvailableChapters=true&includes[]=cover_art&includes[]=author&order[relevance]=desc`,
                {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'eManga/1.0'
                    }
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();

            // Format search results
            const formattedResults = data.data.map(manga => {
                // Find cover art
                let coverFilename = null;
                const coverArt = manga.relationships.find(rel => rel.type === "cover_art");
                if (coverArt && coverArt.attributes && coverArt.attributes.fileName) {
                    coverFilename = coverArt.attributes.fileName;
                }

                // Find author
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
                                return tag.attributes.name.en || Object.values(tag.attributes.name)[0];
                            }
                            return null;
                        })
                        .filter(Boolean)
                        .slice(0, 2)
                    : [];

                return {
                    id: manga.id,
                    title: manga.attributes.title.en || Object.values(manga.attributes.title)[0] || "Untitled",
                    cover: coverFilename ?
                        `https://uploads.mangadex.org/covers/${manga.id}/${coverFilename}.256.jpg` :
                        "https://via.placeholder.com/256x384.png?text=No+Cover",
                    author: author,
                    genres: genres,
                    description: manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "No description available."
                };
            });

            setSearchResults(formattedResults);
            setShowResults(true);
        } catch (err) {
            console.error("Search error:", err);
            if (err.name === 'AbortError') {
                setError("Search timed out. Please try again.");
            } else {
                setError("Search failed. Please try again.");
            }
            setSearchResults([]);
            setShowResults(true);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSelectedIndex(-1);
    };

    const handleSelectManga = (manga) => {
        navigate(`/detail/${manga.id}`, { state: { manga } });
        setSearchTerm('');
        setShowResults(false);
        setSelectedIndex(-1);
    };

    const handlePopularClick = (term) => {
        setSearchTerm(term);
        searchManga(term);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            if (searchResults.length > 0) {
                handleSelectManga(searchResults[0]);
            }
        }
    };

    const handleFocus = () => {
        setShowResults(true);
        setSelectedIndex(-1);
    };

    return (
        <div className="search-container position-relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
                <div className="input-group search-input-group" style={{ minWidth: "320px", maxWidth: "400px" }}>
                    <span className="input-group-text bg-dark border-secondary text-light rounded-start-3">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        ref={inputRef}
                        placeholder="Tìm kiếm manga..."
                        className="form-control bg-dark text-light border-secondary search-input"
                        name="text"
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={handleFocus}
                        aria-label="Search manga"
                        autoComplete="off"
                        style={{
                            borderLeft: 'none',
                            borderRight: searchTerm ? 'none' : undefined
                        }}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary border-secondary clear-btn rounded-end-3"
                            onClick={() => {
                                setSearchTerm('');
                                setSearchResults([]);
                                setShowResults(false);
                                if (inputRef.current) {
                                    inputRef.current.focus();
                                }
                            }}
                            style={{ borderLeft: 'none' }}
                        >
                            <i className="bi bi-x"></i>
                        </button>
                    )}
                    {isSearching && (
                        <span className="position-absolute end-0 top-50 translate-middle-y me-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </span>
                    )}
                </div>
            </form>

            {showResults && (
                <div className="search-results position-absolute mt-3 w-100 bg-dark border-0 rounded-4 shadow-lg overflow-hidden"
                    style={{
                        zIndex: 1050, maxHeight: "600px", minWidth: "480px", width: "130%",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)"
                    }}>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <>
                            <div className="px-4 py-3 border-bottom" style={{ backgroundColor: "rgba(13, 110, 253, 0.1)", borderBottomColor: "rgba(255,255,255,0.1)" }}>
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-search text-primary me-3"></i>
                                    <div>
                                        <h6 className="text-light fw-bold mb-0">Kết quả tìm kiếm</h6>
                                        <small className="text-light opacity-75">{searchResults.length} manga được tìm thấy</small>
                                    </div>
                                </div>
                            </div>

                            <div className="search-results-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                {searchResults.map((manga, index) => (
                                    <div
                                        key={manga.id}
                                        className={`search-result-item p-4 ${selectedIndex === index ? 'selected' : ''}`}
                                        onClick={() => handleSelectManga(manga)}
                                        style={{
                                            cursor: "pointer",
                                            borderBottom: index < searchResults.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                                            transition: "all 0.2s ease"
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div className="d-flex align-items-start">
                                            <div className="flex-shrink-0 me-4">
                                                <div className="manga-cover-wrapper">
                                                    <img
                                                        src={manga.cover}
                                                        alt={manga.title}
                                                        className="rounded-3 shadow-sm"
                                                        style={{
                                                            width: "70px",
                                                            height: "100px",
                                                            objectFit: "cover",
                                                            transition: "transform 0.2s ease"
                                                        }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://via.placeholder.com/70x100/374151/9CA3AF?text=Cover";
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-grow-1 min-w-0">
                                                <div className="mb-2">
                                                    <h6 className="text-light fw-bold mb-1 line-clamp-2"
                                                        title={manga.title}
                                                        style={{ fontSize: "1.1rem", lineHeight: "1.3" }}>
                                                        {manga.title}
                                                    </h6>

                                                    <div className="d-flex align-items-center text-muted mb-2">
                                                        <div className="bg-info bg-opacity-20 rounded-pill px-2 py-1 me-2">
                                                            <i className="bi bi-person-fill me-1 text-info" style={{ fontSize: "12px" }}></i>
                                                            <span className="text-light" style={{ fontSize: "12px", fontWeight: "500" }}>{manga.author}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {manga.genres.length > 0 && (
                                                    <div className="mb-3">
                                                        {manga.genres.map((genre, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="badge me-2 mb-1"
                                                                style={{
                                                                    backgroundColor: "rgba(108, 117, 125, 0.2)",
                                                                    color: "#e9ecef", // Làm sáng màu chữ của genre
                                                                    fontSize: "11px",
                                                                    fontWeight: "500",
                                                                    padding: "4px 8px",
                                                                    border: "1px solid rgba(255,255,255,0.2)"
                                                                }}
                                                            >
                                                                {genre}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <p className="text-light opacity-75 mb-0 line-clamp-2"
                                                    style={{ fontSize: "13px", lineHeight: "1.4" }}>
                                                    {manga.description.length > 150
                                                        ? manga.description.substring(0, 150) + '...'
                                                        : manga.description}
                                                </p>
                                            </div>

                                            <div className="flex-shrink-0 ms-3 d-flex flex-column align-items-center">
                                                <i className="bi bi-arrow-right text-primary mb-2"></i>
                                                <small className="text-light text-center" style={{ fontSize: "11px" }}>
                                                    Đọc ngay
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Popular Searches */}
                    {popularSearches.length > 0 && !searchTerm && (
                        <>
                            <div className="px-4 py-3 border-bottom"
                                style={{ backgroundColor: "rgba(25, 135, 84, 0.1)", borderBottomColor: "rgba(255,255,255,0.1)" }}>
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-fire text-success me-3"></i>
                                    <div>
                                        <h6 className="text-light fw-bold mb-0">Tìm kiếm phổ biến</h6>
                                        <small className="text-muted">Manga được tìm kiếm nhiều nhất</small>
                                    </div>
                                </div>
                            </div>

                            {popularSearches.map((term, index) => (
                                <div
                                    key={index}
                                    className={`p-4 popular-search-item ${selectedIndex === searchResults.length + index ? 'selected' : ''}`}
                                    onClick={() => handlePopularClick(term)}
                                    style={{
                                        cursor: "pointer",
                                        borderBottom: index < popularSearches.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                                        transition: "all 0.2s ease"
                                    }}
                                    onMouseEnter={() => setSelectedIndex(searchResults.length + index)}
                                >
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-fire text-warning me-3"></i>
                                        <span className="text-light fw-medium flex-grow-1">{term}</span>
                                        <i className="bi bi-arrow-up-left text-muted"></i>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="p-5 text-center">
                            <i className="bi bi-exclamation-triangle-fill text-danger fs-4 mb-3"></i>
                            <h6 className="text-light mb-2">Đã xảy ra lỗi</h6>
                            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>{error}</p>
                        </div>
                    )}

                    {/* No Results */}
                    {searchTerm && searchResults.length === 0 && !isSearching && !error && (
                        <div className="p-5 text-center">
                            <i className="bi bi-search text-secondary fs-2 mb-4"></i>
                            <h5 className="text-light mb-3">Không tìm thấy kết quả</h5>
                            <p className="text-muted mb-0">
                                Không có manga nào phù hợp với "<strong className="text-warning">{searchTerm}</strong>"
                            </p>
                            <small className="text-muted">Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả</small>
                        </div>
                    )}

                    {/* Quick Actions Footer */}
                    {(searchResults.length > 0 || (!searchTerm && popularSearches.length > 0)) && (
                        <div className="px-4 py-3 border-top" style={{ backgroundColor: "rgba(0,0,0,0.2)", borderTopColor: "rgba(255,255,255,0.1)" }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-lightbulb text-warning me-2"></i>
                                    <small className="text-muted">Sử dụng ↑↓ để di chuyển, Enter để chọn</small>
                                </div>
                                <small className="text-muted">
                                    <kbd className="bg-secondary text-light border-0 rounded-2 px-2 py-1" style={{ fontSize: "10px" }}>
                                        ESC
                                    </kbd> để đóng
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


