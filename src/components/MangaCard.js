import React, { useState, useEffect } from 'react';
import { useNavigate} from "react-router-dom";
import apiClient from "../utils/apiClient";

function MangaCard({manga}) {
    const navigate = useNavigate();
    const [rating, setRating] = useState('N/A');

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const response = await apiClient.get(`/statistics/manga/${manga.id}`);
                if (response.data && response.data.rating) {
                    const rating = response.data.rating.average;
                    // Format rating to display only 1 decimal place
                    setRating(rating ? rating.toFixed(1) : 'N/A');
                }
            } catch (error) {
                console.error('Error fetching manga rating:', error);
                setRating('N/A');
            }
        };

        if (manga.id) {
            fetchRating();
        }
    }, [manga.id]);

    const handleMangaCard = function(manga){
        navigate(`/manga/${manga.id}`,{state: {manga}});
    }

    // Get genre data for display - handle cases where genre might be missing or improperly formatted
    const getGenres = () => {
        // If manga.genres array is available, use that
        if (manga.genres && Array.isArray(manga.genres) && manga.genres.length > 0) {
            return manga.genres.slice(0, 2);
        }
        
        // Otherwise, try to parse genre string if it exists
        if (manga.genre && typeof manga.genre === 'string') {
            const genreArray = manga.genre.split(',').map(g => g.trim()).filter(Boolean);
            if (genreArray.length > 0) {
                return genreArray.slice(0, 2);
            }
        }
        
        // Default fallback
        return ['Manga'];
    };

    const genres = getGenres();

    return (
        <div 
            className="card h-100 border-0 rounded-3 overflow-hidden shadow-sm manga-card" 
            onClick={() => handleMangaCard(manga)}
            style={{
                transition: "all 0.3s ease",
                cursor: "pointer"
            }}
        >
            <div className="position-relative manga-cover-container">
                <img 
                    src={manga.cover} 
                    alt={manga.title} 
                    className="card-img-top manga-cover" 
                    style={{
                        height: "270px", 
                        objectFit: "cover",
                        transition: "transform 0.3s ease"
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/256x384.png?text=No+Cover";
                    }}
                />
                <div 
                    className="position-absolute start-0 bottom-0 w-100" 
                    style={{
                        background: "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
                        padding: "30px 12px 8px 12px"
                    }}
                >
                    {genres[0] && (
                        <span className="badge bg-primary rounded-pill me-1">{genres[0]}</span>
                    )}
                    {genres[1] && (
                        <span className="badge bg-secondary rounded-pill">{genres[1]}</span>
                    )}
                </div>
            </div>
            <div className="card-body pt-3">
                <h6 className="card-title text-truncate fw-bold mb-1" title={manga.title}>
                    {manga.title}
                </h6>
                <p className="card-text text-muted small mb-2">
                    <i className="bi bi-person me-1"></i>
                    {manga.author}
                </p>
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="small text-warning">
                        <i className="bi bi-star-fill me-1"></i>
                        <span>{rating}</span>
                    </div>
                    <button 
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleMangaCard(manga);
                        }}
                    >
                        <i className="bi bi-book me-1"></i>Read
                    </button>
                </div>
            </div>
        </div>
    )
};

export default MangaCard;