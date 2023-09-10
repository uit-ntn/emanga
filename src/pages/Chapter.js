import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import apiClient from "../utils/apiClient";

function Chapter() {
    const { mangaId, chapterId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [manga, setManga] = useState(location.state && location.state.manga ? location.state.manga : null);
    
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [settings, setSettings] = useState({
        readingMode: "vertical",
        fitMode: "width",
        fontSize: "medium"
    });
    const [retryCount, setRetryCount] = useState(0);
    
    // Fetch manga data if not available in location state
    useEffect(() => {
        const fetchMangaDetails = async () => {
            if (!manga && mangaId) {
                try {
                    console.log('Fetching manga details for ID:', mangaId);
                    const response = await apiClient.get(
                        `/manga/${mangaId}?includes[]=author&includes[]=artist&includes[]=cover_art`
                    );
                    
                    if (response && response.data) {
                        const mangaData = response.data;
                        console.log('Manga data received:', mangaData);
                        
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
                        
                        const formattedManga = {
                            id: mangaData.id,
                            title: mangaData.attributes.title.en || Object.values(mangaData.attributes.title)[0] || "Untitled",
                            cover: coverFilename ? 
                                `https://uploads.mangadex.org/covers/${mangaData.id}/${coverFilename}.512.jpg` : 
                                "https://via.placeholder.com/512x768.png?text=No+Cover",
                            author: author,
                            genre: genres.join(', '),
                            description: mangaData.attributes.description.en || Object.values(mangaData.attributes.description)[0] || "No description available."
                        };
                        
                        console.log('Formatted manga:', formattedManga);
                        setManga(formattedManga);
                    }
                } catch (err) {
                    console.error("Error fetching manga details:", err);
                    // Set a default manga object if fetch fails
                    setManga({
                        id: mangaId,
                        title: "Unknown Manga",
                        author: "Unknown Author",
                        cover: "https://via.placeholder.com/512x768.png?text=No+Cover"
                    });
                }
            }
        };
        
        fetchMangaDetails();
    }, [mangaId, manga]);
    
    // Fetch chapter data from API using apiClient
    useEffect(() => {
        const fetchChapter = async () => {
            if (!chapterId || !mangaId) {
                setError("Invalid chapter or manga ID");
                setLoading(false);
                return;
            }

            try {
                console.log('Starting to fetch chapter:', { chapterId, mangaId });
                setLoading(true);
                setCurrentPage(0);
                setError(null);
                
                // Step 1: Get chapter info
                let chapterResponse;
                try {
                    chapterResponse = await apiClient.get(`/chapter/${chapterId}`);
                    console.log('Chapter response received:', chapterResponse);
                } catch (chapterErr) {
                    console.error('Failed to fetch chapter info:', chapterErr);
                    throw new Error(`Could not fetch chapter info: ${chapterErr.message}`);
                }
                
                if (!chapterResponse || !chapterResponse.data) {
                    throw new Error("Invalid chapter data structure received");
                }
                
                const chapterData = chapterResponse.data;
                
                // Check if chapter has pages data
                if (!chapterData.attributes) {
                    throw new Error("Chapter attributes missing from API response");
                }

                console.log('Getting image server from MangaDex...');
                const serverResponse = await apiClient.get(`/at-home/server/${chapterId}`);
                
                if (!serverResponse || !serverResponse.baseUrl || !serverResponse.chapter) {
                    throw new Error("Image server response missing required data");
                }
                
                // Tạo URLs cho từng trang
                const baseUrl = serverResponse.baseUrl;
                const hash = serverResponse.chapter.hash;
                const pages = serverResponse.chapter.data;
                const pagesSaver = serverResponse.chapter.dataSaver;
                
                // Kiểm tra xem chapter có ảnh hay không
                if (!hash || !pages || pages.length === 0) {
                    throw new Error("This chapter has no images available");
                }

                // Mặc định sử dụng chất lượng cao
                let pageUrls = pages.map(
                    filename => `${baseUrl}/data/${hash}/${filename}`
                );
                
                console.log('Generated page URLs:', {
                    totalPages: pageUrls.length,
                    baseUrl: baseUrl,
                    quality: 'data',
                    sampleUrls: pageUrls.slice(0, 2)
                });
                
                // Kiểm tra URL ảnh đầu tiên để đảm bảo có thể truy cập
                try {
                    console.log('Testing first image URL...');
                    const testController = new AbortController();
                    setTimeout(() => testController.abort(), 5000);
                    
                    const testImageResponse = await fetch(pageUrls[0], { 
                        method: 'HEAD',
                        mode: 'cors',
                        signal: testController.signal
                    });
                    
                    if (!testImageResponse.ok) {
                        throw new Error(`Image test failed with status: ${testImageResponse.status}`);
                    }
                    
                    console.log('Images are accessible:', {
                        status: testImageResponse.status,
                        contentType: testImageResponse.headers.get('content-type'),
                        contentLength: testImageResponse.headers.get('content-length')
                    });
                } catch (imageTestError) {
                    console.warn('Image test failed:', imageTestError.message);
                    // Thử lại với chất lượng thấp hơn (dataSaver)
                    pageUrls = pagesSaver.map(
                        filename => `${baseUrl}/data-saver/${hash}/${filename}`
                    );
                    console.log('Falling back to data-saver quality...');
                }

                // Find previous and next chapters
                let prevChapter = null;
                let nextChapter = null;
                
                console.log('Finding navigation chapters...');
                
                try {
                    const chaptersResponse = await apiClient.get(
                        `/manga/${mangaId}/feed?limit=50&translatedLanguage[]=en&order[chapter]=asc&includes[]=scanlation_group`
                    );
                    
                    if (chaptersResponse && chaptersResponse.data && chaptersResponse.data.length > 0) {
                        const chapters = chaptersResponse.data;
                        console.log('Found chapters for navigation:', chapters.length);
                        
                        // Sort chapters by their number for proper navigation
                        chapters.sort((a, b) => {
                            const aNum = parseFloat(a.attributes.chapter || '0');
                            const bNum = parseFloat(b.attributes.chapter || '0');
                            return aNum - bNum;
                        });
                        
                        const currentIndex = chapters.findIndex(chap => chap.id === chapterId);
                        console.log('Current chapter position:', currentIndex, 'of', chapters.length);
                        
                        if (currentIndex > 0) {
                            prevChapter = chapters[currentIndex - 1];
                            console.log('Previous chapter found:', prevChapter.id);
                        }
                        
                        if (currentIndex < chapters.length - 1) {
                            nextChapter = chapters[currentIndex + 1];
                            console.log('Next chapter found:', nextChapter.id);
                        }
                    }
                } catch (err) {
                    console.warn("Could not fetch chapter list for navigation:", err.message);
                }
                
                // Get chapter's publication date
                const publishDate = chapterData.attributes.publishAt 
                    ? new Date(chapterData.attributes.publishAt)
                    : new Date();
                
                // Create chapter object with real data
                const formattedChapter = {
                    id: chapterId,
                    title: chapterData.attributes.title || `Chapter ${chapterData.attributes.chapter || '?'}`,
                    number: chapterData.attributes.chapter || '?',
                    publishDate: publishDate,
                    pages: pageUrls,
                    totalPages: pageUrls.length,
                    volumeNumber: chapterData.attributes.volume || null,
                    nextChapter: nextChapter ? nextChapter.id : null,
                    prevChapter: prevChapter ? prevChapter.id : null,
                    nextChapterNumber: nextChapter ? nextChapter.attributes.chapter : null,
                    prevChapterNumber: prevChapter ? prevChapter.attributes.chapter : null
                };
                
                console.log('Chapter successfully loaded with REAL IMAGES:', {
                    id: formattedChapter.id,
                    title: formattedChapter.title,
                    pageCount: formattedChapter.pages.length,
                    hasNext: !!formattedChapter.nextChapter,
                    hasPrev: !!formattedChapter.prevChapter,
                    firstPageUrl: formattedChapter.pages[0],
                    isRealData: !formattedChapter.pages[0].includes('placeholder')
                });
                
                setChapter(formattedChapter);
                setLoading(false);
                
                // Update document title with chapter information
                if (manga && manga.title) {
                    document.title = `${formattedChapter.title} - ${manga.title}`;
                }
                
            } catch (err) {
                console.error("Error fetching chapter:", err);
                
                let errorMessage = "Không thể tải dữ liệu từ API.";
                if (err.message.includes('Could not fetch chapter info')) {
                    errorMessage = "Không thể lấy thông tin chapter từ MangaDex API.";
                } else if (err.message.includes('Could not get image server')) {
                    errorMessage = "Không thể lấy server ảnh từ MangaDex.";
                } else if (err.message.includes('No chapters with images found')) {
                    errorMessage = "Manga này hiện chưa có chapter nào có ảnh.";
                } else if (err.message.includes('This chapter has no images available')) {
                    errorMessage = "Chapter này không có ảnh. Hệ thống đã thử tìm chapter khác.";
                } else if (err.name === 'AbortError') {
                    errorMessage = "Yêu cầu quá thời gian.";
                } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
                    errorMessage = "Lỗi mạng. Kiểm tra kết nối internet.";
                }
                
                setError(`${errorMessage}\n\nChi tiết: ${err.message}`);
                setLoading(false);
                
                console.warn('Chapter loading failed completely:', errorMessage);
            }
        };

        if (chapterId && mangaId) {
            fetchChapter();
        }
    }, [chapterId, mangaId, navigate]); // Thêm navigate vào dependencies

    // Manual retry
    const handleRetry = () => {
        setLoading(true);
        setError(null);
        setRetryCount(0);
    };

    // Handle navigation to next/previous chapter
    const goToChapter = (nextChapterId) => {
        if (nextChapterId) {
            console.log('Navigating to chapter:', nextChapterId);
            navigate(`/manga/${mangaId}/chapter/${nextChapterId}`, { state: { manga } });
        }
    };

    // Handle reading mode change
    const changeReadingMode = (mode) => {
        setSettings(prev => ({ ...prev, readingMode: mode }));
        setCurrentPage(0);
    };

    // Handle fit mode change
    const changeFitMode = (mode) => {
        setSettings(prev => ({ ...prev, fitMode: mode }));
    };
    
    // Handle font size change
    const changeFontSize = (size) => {
        setSettings(prev => ({ ...prev, fontSize: size }));
    };
    
    // Navigation for pagination mode
    const goToNextPage = () => {
        if (chapter && currentPage < chapter.pages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const goToPrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (settings.readingMode === "pagination" && chapter) {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    goToNextPage();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    goToPrevPage();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentPage, chapter, settings.readingMode]);

    if (loading) {
        return (
            <div className="h-100 d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-light mt-3">Đang tải chapter...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4 className="alert-heading">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Lỗi!
                    </h4>
                    <p className="mb-0 white-space-pre-line">{error}</p>
                    <hr />
                    <button className="btn btn-outline-danger" onClick={handleRetry}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="chapter-reader bg-dark min-vh-100">
            {/* Chapter Header */}
            <div className="chapter-header bg-dark text-light p-3 border-bottom border-secondary sticky-top">
                <div className="container-fluid">
                    <div className="row align-items-center">
                        <div className="col">
                            <h4 className="mb-0">
                                {chapter?.title || 'Loading...'}
                            </h4>
                            {manga && (
                                <small className="text-muted">
                                    {manga.title}
                                </small>
                            )}
                        </div>
                        <div className="col-auto">
                            <div className="btn-group">
                                {/* Nút trở về trang chi tiết manga */}
                                <Link 
                                    to={`/manga/${mangaId}`}
                                    className="btn btn-outline-light"
                                    title="Trở về trang chi tiết manga"
                                >
                                    <i className="bi bi-book"></i>
                                </Link>
                                {/* Nút Previous Chapter */}
                                {chapter?.prevChapter && (
                                    <button 
                                        className="btn btn-outline-light" 
                                        onClick={() => goToChapter(chapter.prevChapter)}
                                        title={`Chapter trước: ${chapter.prevChapterNumber}`}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                )}
                                {/* Nút Next Chapter */}
                                {chapter?.nextChapter && (
                                    <button 
                                        className="btn btn-outline-light"
                                        onClick={() => goToChapter(chapter.nextChapter)}
                                        title={`Chapter tiếp: ${chapter.nextChapterNumber}`}
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Reading Mode Controls */}
                        <div className="col-auto">
                            <div className="btn-group">
                                <button
                                    className={`btn btn-outline-light ${settings.readingMode === 'vertical' ? 'active' : ''}`}
                                    onClick={() => changeReadingMode('vertical')}
                                    title="Đọc dọc"
                                >
                                    <i className="bi bi-arrows-vertical"></i>
                                </button>
                                <button
                                    className={`btn btn-outline-light ${settings.readingMode === 'horizontal' ? 'active' : ''}`}
                                    onClick={() => changeReadingMode('horizontal')}
                                    title="Đọc ngang"
                                >
                                    <i className="bi bi-arrows-horizontal"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapter Content */}
            <div className="chapter-content container-fluid p-0">
                {settings.readingMode === 'vertical' ? (
                    // Vertical Reading Mode
                    <div className="vertical-reader">
                        {chapter?.pages.map((pageUrl, index) => (
                            <div 
                                key={index}
                                className="page-container mb-2 text-center"
                                style={{ maxWidth: '800px', margin: '0 auto' }}
                            >
                                <img
                                    src={pageUrl}
                                    alt={`Page ${index + 1}`}
                                    className="img-fluid"
                                    style={{
                                        maxWidth: settings.fitMode === 'width' ? '100%' : 'auto',
                                        maxHeight: settings.fitMode === 'height' ? '100vh' : 'auto'
                                    }}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/800x1200/374151/9CA3AF?text=Failed+to+load+image";
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Horizontal Reading Mode
                    <div className="horizontal-reader d-flex align-items-center justify-content-center min-vh-100">
                        {chapter?.pages[currentPage] && (
                            <div className="position-relative w-100 h-100 d-flex justify-content-center align-items-center">
                                <img
                                    src={chapter.pages[currentPage]}
                                    alt={`Page ${currentPage + 1}`}
                                    className="img-fluid"
                                    style={{
                                        maxWidth: settings.fitMode === 'width' ? '100%' : 'auto',
                                        maxHeight: settings.fitMode === 'height' ? '100vh' : 'auto',
                                        objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/800x1200/374151/9CA3AF?text=Failed+to+load+image";
                                    }}
                                />
                                {/* Navigation Buttons */}
                                <div className="position-absolute start-0 top-50 translate-middle-y">
                                    {currentPage > 0 && (
                                        <button
                                            className="btn btn-dark btn-lg opacity-75 ms-2"
                                            onClick={goToPrevPage}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="position-absolute end-0 top-50 translate-middle-y">
                                    {currentPage < (chapter?.pages.length || 0) - 1 && (
                                        <button
                                            className="btn btn-dark btn-lg opacity-75 me-2"
                                            onClick={goToNextPage}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    )}
                                </div>
                                {/* Page Counter */}
                                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                                    <div className="badge bg-dark opacity-75">
                                        Page {currentPage + 1} of {chapter?.pages.length || 0}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Loading Indicator for Image Loading */}
            {chapter?.pages && chapter.pages.length > 0 && (
                <div className="position-fixed bottom-0 end-0 m-3">
                    <div className="progress" style={{ width: '150px', height: '3px' }}>
                        <div 
                            className="progress-bar" 
                            role="progressbar"
                            style={{ 
                                width: `${(currentPage + 1) * 100 / chapter.pages.length}%`
                            }}
                            aria-valuenow={currentPage + 1}
                            aria-valuemin="0"
                            aria-valuemax={chapter.pages.length}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chapter;