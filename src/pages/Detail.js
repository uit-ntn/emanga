import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from "../utils/apiClient";

function Detail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [manga, setManga] = useState(location.state && location.state.manga ? location.state.manga : null);
    const [chapters, setChapters] = useState([]);
    const [totalChapters, setTotalChapters] = useState(0);
    const [activeTab, setActiveTab] = useState('content');
    const [statistics, setStatistics] = useState(null);

    // Fetch manga details and statistics
    useEffect(() => {
        async function fetchMangaDetails() {
            if (!id && !manga) {
                navigate("/");
                return;
            }

            const mangaId = id || manga.id;
            setLoading(true);
            
            try {
                // Fetch manga details if not available
                if (!manga || !manga.description) {
                    const response = await apiClient.get(
                        `/manga/${mangaId}?includes[]=author&includes[]=artist&includes[]=cover_art`
                    );
                    
                    const mangaData = response.data;
                    
                    // Find cover art
                    let coverFilename = null;
                    const coverArt = mangaData.relationships.find(rel => rel.type === "cover_art");
                    if (coverArt && coverArt.attributes && coverArt.attributes.fileName) {
                        coverFilename = coverArt.attributes.fileName;
                    }
                    
                    // Find author
                    let author = "Unknown Author";
                    const authorRel = mangaData.relationships.find(rel => rel.type === "author");
                    if (authorRel && authorRel.attributes && authorRel.attributes.name) {
                        author = authorRel.attributes.name;
                    }
                    
                    // Get genres
                    const genres = mangaData.attributes.tags && Array.isArray(mangaData.attributes.tags)
                        ? mangaData.attributes.tags
                            .filter(tag => tag.attributes && tag.attributes.group === "genre")
                            .map(tag => {
                                if (tag.attributes && tag.attributes.name) {
                                    return tag.attributes.name.en || Object.values(tag.attributes.name)[0];
                                }
                                return null;
                            })
                            .filter(Boolean)
                        : [];
                    
                    setManga({
                        id: mangaData.id,
                        title: mangaData.attributes.title.en || Object.values(mangaData.attributes.title)[0] || "Untitled",
                        cover: coverFilename ? 
                            `https://uploads.mangadex.org/covers/${mangaData.id}/${coverFilename}.512.jpg` : 
                            "https://via.placeholder.com/512x768.png?text=No+Cover",
                        author: author,
                        genre: genres.join(', '),
                        description: mangaData.attributes.description.en || Object.values(mangaData.attributes.description)[0] || "No description available.",
                        status: mangaData.attributes.status || "unknown"
                    });
                }

                // Fetch statistics
                const statsResponse = await apiClient.get(`/statistics/manga/${mangaId}`);
                if (statsResponse.data) {
                    setStatistics(statsResponse.data);
                }
                
                // Fetch chapters
                const chaptersResponse = await apiClient.get(
                    `/manga/${mangaId}/feed?limit=20&order[chapter]=desc&translatedLanguage[]=en&includes[]=scanlation_group`
                );
                
                if (chaptersResponse.data) {
                    setChapters(chaptersResponse.data.map(chapter => {
                        let groupName = 'Unknown Group';
                        const groupRel = chapter.relationships.find(rel => rel.type === 'scanlation_group');
                        if (groupRel && groupRel.attributes && groupRel.attributes.name) {
                            groupName = groupRel.attributes.name;
                        }
                        
                        return {
                            id: chapter.id,
                            chapter: chapter.attributes.chapter || 'N/A',
                            title: chapter.attributes.title || `Chapter ${chapter.attributes.chapter || 'Unknown'}`,
                            pages: chapter.attributes.pages || 0,
                            publishDate: new Date(chapter.attributes.publishAt),
                            group: groupName
                        };
                    }));
                    
                    setTotalChapters(chaptersResponse.total);
                }
                
            } catch (err) {
                console.error('Error fetching manga details:', err);
                setError('Không thể tải thông tin manga. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        }
        
        fetchMangaDetails();
    }, [id, manga, navigate]);

    // Display loading state
    if (loading) {
        return (
            <Layout>
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status" style={{width: "3rem", height: "3rem"}}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải thông tin manga...</p>
                </div>
            </Layout>
        );
    }
    
    // Display error state
    if (error) {
        return (
            <Layout>
                <div className="container py-5 text-center">
                    <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                    <button 
                        className="btn btn-primary mt-3"
                        onClick={() => navigate(-1)}
                    >
                        <i className="bi bi-arrow-left me-2"></i>Quay lại
                    </button>
                </div>
            </Layout>
        );
    }
    
    // If manga is null or undefined after loading
    if (!manga) {
        return (
            <Layout>
                <div className="container py-5 text-center">
                    <div className="alert alert-warning" role="alert">
                        <i className="bi bi-exclamation-circle-fill me-2"></i>
                        Không tìm thấy thông tin manga
                    </div>
                    <button 
                        className="btn btn-primary mt-3"
                        onClick={() => navigate("/")}
                    >
                        <i className="bi bi-house me-2"></i>Về trang chủ
                    </button>
                </div>
            </Layout>
        );
    }

    // Format status for display
    const formattedStatus = 
        manga.status === "completed" ? "Hoàn thành" : 
        manga.status === "ongoing" ? "Đang cập nhật" : 
        manga.status === "hiatus" ? "Tạm ngưng" : 
        manga.status === "cancelled" ? "Đã hủy" : "Không rõ";

    // Format follows count
    const formattedFollows = statistics?.follows ? statistics.follows.toLocaleString() : '0';

    return (
        <Layout>
            <div className="detail-page">
                {/* Simplified Hero Section */}
                <div className="hero-section py-5" style={{ background: '#1a1a1a' }}>
                    <div className="container">
                        <div className="row align-items-center">
                            {/* Manga Cover */}
                            <div className="col-lg-4 col-md-5 mb-4 mb-md-0">
                                <div className="text-center">
                                    <img 
                                        src={manga.cover} 
                                        alt={manga.title || "Manga Cover"} 
                                        className="img-fluid rounded-3"
                                        style={{
                                            maxHeight: '500px',
                                            objectFit: 'cover',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = "https://via.placeholder.com/450x600.png?text=No+Cover";
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Manga Information */}
                            <div className="col-lg-8 col-md-7">
                                <div className="text-white">
                                    {/* Title */}
                                    <h1 className="display-4 fw-bold mb-3" style={{color: '#fff'}}>
                                        {manga.title}
                                    </h1>

                                    {/* Author */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-person-fill fs-4 me-2 text-gray-400"></i>
                                            <div>
                                                <small className="text-gray-400">Tác giả</small>
                                                <div className="text-white fw-bold">{manga.author}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Genres */}
                                    {manga.genre && (
                                        <div className="mb-4">
                                            <h6 className="text-gray-400 mb-2">
                                                <i className="bi bi-tags me-2"></i>Thể Loại
                                            </h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {manga.genre.split(',').map((genre, index) => (
                                                    <span key={index} className="badge bg-gray-700 text-white px-3 py-2">
                                                        {genre.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="row g-3">
                                        <div className="col-auto">
                                            <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                                <div className="text-gray-400 small">Số chương</div>
                                                <div className="text-white fw-bold">{totalChapters}</div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                                <div className="text-gray-400 small">Tình trạng</div>
                                                <div className="text-white fw-bold">{formattedStatus}</div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                                <div className="text-gray-400 small">Lượt theo dõi</div>
                                                <div className="text-white fw-bold">
                                                    <i className="bi bi-heart-fill me-1 text-danger"></i>
                                                    {formattedFollows}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Content Section */}
                <div className="content-section py-5">
                    <div className="container">
                        {/* Modern Tab Navigation */}
                        <div className="tab-navigation mb-5">
                            <div className="nav-pills-wrapper bg-white rounded-4 shadow-lg p-2">
                                <ul className="nav nav-pills nav-fill justify-content-center mb-0">
                                    <li className="nav-item flex-fill">
                                        <button 
                                            className={`nav-link rounded-3 py-3 fw-bold transition-all border-0 w-100 ${activeTab === 'content' ? 'active bg-gradient-primary text-white shadow' : 'text-dark bg-transparent'}`}
                                            onClick={() => setActiveTab('content')}
                                        >
                                            <i className="bi bi-book me-2"></i>Nội Dung
                                        </button>
                                    </li>
                                    <li className="nav-item flex-fill">
                                        <button 
                                            className={`nav-link rounded-3 py-3 fw-bold transition-all border-0 w-100 ${activeTab === 'chapters' ? 'active bg-gradient-success text-white shadow' : 'text-dark bg-transparent'}`}
                                            onClick={() => setActiveTab('chapters')}
                                        >
                                            <i className="bi bi-list-ol me-2"></i>Chương Truyện
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Enhanced Tab Content */}
                        <div className="tab-content">
                            {activeTab === 'content' && (
                                <div className="content-tab animated-tab">
                                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                        <div className="card-header bg-gradient-primary text-white p-4 border-0">
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <h4 className="mb-1 fw-bold">Giới thiệu về truyện</h4>
                                                    <p className="mb-0 opacity-75">Thông tin chi tiết và mô tả</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body p-5">
                                            {/* Description Section */}
                                            <div className="description-section mb-5">
                                                <div className="lead lh-lg text-dark" style={{fontSize: "1.1rem"}}>
                                                    {manga.description || 'Không có mô tả cho truyện này.'}
                                                </div>
                                            </div>
                                            
                                            {/* Info Grid */}
                                            <div className="info-grid bg-light rounded-4 p-4">
                                                <h5 className="mb-4 text-primary fw-bold d-flex align-items-center">
                                                    <div className="info-icon bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                                        <i className="bi bi-clipboard-data text-primary"></i>
                                                    </div>
                                                    Thông tin chi tiết
                                                </h5>
                                                <div className="row g-4">
                                                    <div className="col-md-6">
                                                        <div className="info-item bg-white rounded-3 p-4 h-100 shadow-sm">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="bi bi-person-fill text-primary me-2 fs-5"></i>
                                                                <span className="text-muted fw-semibold">Tác giả</span>
                                                            </div>
                                                            <span className="fw-bold text-dark fs-5">{manga.author}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item bg-white rounded-3 p-4 h-100 shadow-sm">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="bi bi-tags-fill text-success me-2 fs-5"></i>
                                                                <span className="text-muted fw-semibold">Thể loại</span>
                                                            </div>
                                                            <span className="fw-bold text-dark fs-5">{manga.genre || 'Chưa phân loại'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item bg-white rounded-3 p-4 h-100 shadow-sm">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="bi bi-clock-fill text-warning me-2 fs-5"></i>
                                                                <span className="text-muted fw-semibold">Tình trạng</span>
                                                            </div>
                                                            <span className={`badge ${
                                                                formattedStatus === 'Hoàn thành' ? 'bg-success' :
                                                                formattedStatus === 'Đang cập nhật' ? 'bg-primary' :
                                                                formattedStatus === 'Tạm ngưng' ? 'bg-warning' :
                                                                'bg-secondary'
                                                            } fs-6 px-3 py-2 rounded-pill`}>
                                                                <i className={`bi ${
                                                                    formattedStatus === 'Hoàn thành' ? 'bi-check-circle-fill' :
                                                                    formattedStatus === 'Đang cập nhật' ? 'bi-arrow-repeat' :
                                                                    formattedStatus === 'Tạm ngưng' ? 'bi-pause-circle-fill' :
                                                                    'bi-question-circle-fill'
                                                                } me-1`}></i>
                                                                {formattedStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item bg-white rounded-3 p-4 h-100 shadow-sm">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="bi bi-graph-up text-info me-2 fs-5"></i>
                                                                <span className="text-muted fw-semibold">Lượt xem</span>
                                                            </div>
                                                            <span className="fw-bold text-primary fs-5">
                                                                <i className="bi bi-eye-fill me-1"></i>
                                                                {manga.attributes && manga.attributes.views ? manga.attributes.views.toLocaleString() : '0'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'chapters' && (
                                <div className="chapters-tab animated-tab">
                                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                        <div className="card-header bg-gradient-success text-white p-4 border-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <div>
                                                        <h4 className="mb-1 fw-bold">Danh sách chương</h4>
                                                        <p className="mb-0 opacity-75">
                                                            <i className="bi bi-bookmark-fill me-1"></i>{totalChapters} chương có sẵn
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="search-box">
                                                    <div className="input-group">
                                                        <input type="text" className="form-control bg-white bg-opacity-20 border-0 text-white rounded-pill" placeholder="Tìm chương..." />
                                                        <button className="btn btn-light rounded-pill shadow-sm ms-2">
                                                            <i className="bi bi-search"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body p-0">
                                            {chapters.length === 0 ? (
                                                <div className="text-center py-5">
                                                    <div className="empty-illustration mb-4">
                                                        <div className="empty-icon bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm" 
                                                            style={{width: "120px", height: "120px"}}>
                                                            <i className="bi bi-journal-x text-secondary" style={{fontSize: "3rem"}}></i>
                                                        </div>
                                                    </div>
                                                    <h4 className="text-muted mb-3">Không có chương nào</h4>
                                                    <p className="text-muted mb-0">Truyện này chưa có chương nào được thêm vào.</p>
                                                </div>
                                            ) : (
                                                <div className="chapters-list">
                                                    {chapters.map((chapter, i) => (
                                                        <div key={chapter.id} className="chapter-item border-bottom p-4 chapter-hover-effect">
                                                            <div className="row align-items-center">
                                                                <div className="col-md-6">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="chapter-number bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                                                                            style={{width: "50px", height: "50px"}}>
                                                                            <i className="bi bi-book-fill text-primary fs-5"></i>
                                                                        </div>
                                                                        <div>
                                                                            <h6 className="fw-bold mb-1 text-dark">
                                                                                <i className="bi bi-bookmark-check me-1"></i>Chapter {chapter.chapter}
                                                                            </h6>
                                                                            <p className="text-muted mb-0 small">
                                                                                <i className="bi bi-file-text me-1"></i>
                                                                                {chapter.title || `${manga.title} - Phần ${chapter.chapter}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-2 text-center">
                                                                    <div className="chapter-date">
                                                                        <i className="bi bi-calendar-check text-muted me-1"></i>
                                                                        <small className="text-muted">
                                                                            {chapter.publishDate.toLocaleDateString('vi-VN')}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-2 text-center">
                                                                    <span className="badge bg-secondary bg-opacity-75 rounded-pill px-3 py-2">
                                                                        <i className="bi bi-people-fill me-1"></i>
                                                                        {chapter.group}
                                                                    </span>
                                                                </div>
                                                                <div className="col-md-2 text-end">
                                                                    <Link 
                                                                        to={`/manga/${manga.id}/chapter/${chapter.id}`} 
                                                                        state={{ manga }} 
                                                                        className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm chapter-read-btn"
                                                                    >
                                                                        <i className="bi bi-play-circle-fill me-1"></i>Đọc
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Enhanced Pagination */}
                                            {totalChapters > 20 && (
                                                <div className="pagination-section p-4 bg-light">
                                                    <nav aria-label="Chapter navigation">
                                                        <ul className="pagination justify-content-center mb-0">
                                                            <li className="page-item disabled">
                                                                <span className="page-link rounded-pill border-0 shadow-sm"><i className="bi bi-chevron-left"></i></span>
                                                            </li>
                                                            <li className="page-item active">
                                                                <span className="page-link rounded-pill border-0 shadow-sm bg-primary">1</span>
                                                            </li>
                                                            <li className="page-item">
                                                                <a className="page-link rounded-pill border-0 shadow-sm" href="#">2</a>
                                                            </li>
                                                            <li className="page-item">
                                                                <a className="page-link rounded-pill border-0 shadow-sm" href="#">3</a>
                                                            </li>
                                                            <li className="page-item">
                                                                <a className="page-link rounded-pill border-0 shadow-sm" href="#"><i className="bi bi-chevron-right"></i></a>
                                                            </li>
                                                        </ul>
                                                    </nav>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced CSS with Modern Animations */}
            <style jsx>{`
                .glass-morphism {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .manga-cover-main:hover {
                    transform: scale(1.02);
                }
                
                .stat-card:hover {
                    transform: translateY(-5px);
                    transition: all 0.3s ease;
                }
                
                .stat-card:hover i {
                    transform: scale(1.1);
                    transition: all 0.3s ease;
                }
                
                .chapter-hover-effect:hover {
                    background: linear-gradient(90deg, rgba(13, 110, 253, 0.05) 0%, rgba(13, 110, 253, 0.02) 100%);
                    border-left: 4px solid #0d6efd;
                    transition: all 0.3s ease;
                }
                
                .chapter-read-btn:hover {
                    transform: translateX(5px);
                }
                
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
                }
                
                .bg-gradient-info {
                    background: linear-gradient(135deg, #0dcaf0 0%, #6f42c1 100%);
                }
                
                .bg-gradient-success {
                    background: linear-gradient(135deg, #198754 0%, #20c997 100%);
                }
                
                .transition-all {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .animated-tab {
                    animation: fadeInUp 0.6s ease;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .title-text {
                    animation: titleGlow 3s ease-in-out infinite alternate;
                }
                
                @keyframes titleGlow {
                    from {
                        text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
                    }
                    to {
                        text-shadow: 2px 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(255,255,255,0.3);
                    }
                }
                
                .letter-spacing {
                    letter-spacing: 2px;
                }
                
                .nav-pills .nav-link:hover:not(.active) {
                    background-color: rgba(13, 110, 253, 0.1);
                    transform: translateY(-2px);
                }
                
                .genre-tag:hover {
                    transform: translateY(-2px);
                    transition: all 0.3s ease;
                }
                
                .min-vh-50 {
                    min-height: 50vh;
                }
                
                .text-gray-400 {
                    color: #9ca3af;
                }
                .bg-gray-700 {
                    background-color: #374151;
                }
            `}</style>
        </Layout>
    )
}

export default Detail;


