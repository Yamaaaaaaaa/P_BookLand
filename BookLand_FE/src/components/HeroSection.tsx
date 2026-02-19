import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/components/hero-section.css';
import { useEffect, useState } from 'react';
import type { Event } from '../types/Event';
import { eventService } from '../api/eventService';
import authorService from '../api/authorService';
import type { Author } from '../types/Author';

const HeroSection = () => {
    const [event, setEvent] = useState<Event | null>(null);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await eventService.getHighestPriorityEvent();
                if (response.result) {
                    setEvent(response.result);
                }
            } catch (error) {
                console.error("Failed to fetch priority event", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchAuthors = async () => {
            try {
                // Fetch first 2 authors
                const response = await authorService.getAllAuthors({ page: 0, size: 2 });
                if (response.result && response.result.content) {
                    setAuthors(response.result.content);
                }
            } catch (error) {
                console.error("Failed to fetch authors", error);
            }
        };

        fetchEvent();
        fetchAuthors();
    }, []);

    const images = event?.images || [];
    const sortedImages = [...images].sort((a, b) => {
        if (a.imageType === 'MAIN') return -1;
        if (b.imageType === 'MAIN') return 1;
        return 0;
    });

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
    };
    return (
        <section className="hero-section">
            <div className="hero-container">
                {/* Top Row: Main Slider + Side Banners */}
                <div className="hero-top-row">
                    <div className="hero-main-slider">
                        {isLoading ? (
                            <div className="hero-slider-item" style={{ backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div className="spinner" style={{
                                    border: '4px solid #f3f3f3',
                                    borderTop: '4px solid #C92127',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <style>{`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                        ) : sortedImages.length > 0 ? (
                            <>
                                <div
                                    className="hero-slider-item"
                                    style={{
                                        backgroundImage: `url(${sortedImages[currentSlide]?.imageUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        // Navigate to event detail or related items if needed
                                        // For now, just a placeholder or maybe scroll to Super Sale if it's that event
                                    }}
                                >
                                </div>
                                <div className="hero-slider-nav">
                                    <button className="hero-slider-arrow prev" onClick={prevSlide}><ChevronLeft size={24} /></button>
                                    <button className="hero-slider-arrow next" onClick={nextSlide}><ChevronRight size={24} /></button>
                                </div>
                                <div className="hero-slider-dots">
                                    {sortedImages.map((_, index) => (
                                        <span
                                            key={index}
                                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                                            onClick={() => setCurrentSlide(index)}
                                        ></span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Link to="/shop/category/featured" className="hero-slider-item" style={{ backgroundColor: '#C92127', display: 'flex' }}>
                                <div className="hero-slider-placeholder">Main Slider Banner</div>
                            </Link>
                        )}
                    </div>
                    <div className="hero-side-banners">
                        {authors.length >= 2 ? (
                            <>
                                <div style={{
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    color: '#C92127',
                                    marginBottom: '4px',
                                    fontSize: '14px',
                                    paddingLeft: '4px'
                                }}>
                                    Tác giả nổi bật
                                </div>
                                {authors.slice(0, 2).map((author, index) => (
                                    <div key={author.id} className="hero-side-banner" style={{
                                        backgroundColor: index === 0 ? '#E1F5FE' : '#FFF3E0', // Light Blue / Light Orange
                                        textDecoration: 'none',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        padding: '10px 15px',
                                        textAlign: 'left',
                                        gap: '15px'
                                    }}>
                                        <div style={{ flexShrink: 0 }}>
                                            {author.authorImage ? (
                                                <img
                                                    src={author.authorImage}
                                                    alt={author.name}
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        border: '2px solid white',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#ccc',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                    fontSize: '24px'
                                                }}>
                                                    {author.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{author.name}</h3>
                                            <p style={{
                                                margin: '0',
                                                fontSize: '12px',
                                                color: '#666',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: '1.4'
                                            }}>
                                                {author.description || 'Chưa có mô tả'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <Link to="/shop/category/sale" className="hero-side-banner" style={{ backgroundColor: '#AEEEEE', textDecoration: 'none' }}>
                                    Side Banner 1
                                </Link>
                                <Link to="/shop/category/new" className="hero-side-banner" style={{ backgroundColor: '#FFD39B', textDecoration: 'none' }}>
                                    Side Banner 2
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Middle Row: Promo Banners */}
                <div className="hero-promo-banners">
                    <Link to="/shop/category/promo1" className="hero-promo-banner" style={{ backgroundColor: '#FFB6C1', textDecoration: 'none' }}>Promo 1</Link>
                    <Link to="/shop/category/promo2" className="hero-promo-banner" style={{ backgroundColor: '#E0FFFF', textDecoration: 'none' }}>Promo 2</Link>
                    <Link to="/shop/category/promo3" className="hero-promo-banner" style={{ backgroundColor: '#F0E68C', textDecoration: 'none' }}>Promo 3</Link>
                    <Link to="/shop/category/promo4" className="hero-promo-banner" style={{ backgroundColor: '#98FB98', textDecoration: 'none' }}>Promo 4</Link>
                </div>

                {/* Bottom Row: Icon Menu */}
                <div className="hero-icon-menu">
                    {[
                        { label: 'Super Sale', icon: '⚡', id: 'super-sale-section' },
                        { label: 'Xu Hướng', icon: '📈', id: 'trending-section' },
                        { label: 'Nổi Bật', icon: '🌟', id: 'featured-section' },
                        { label: 'Bán Chạy', icon: '🏆', id: 'bestseller-section' },
                        { label: 'Gợi Ý', icon: '💡', id: 'recommendation-section' },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="hero-icon-item"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                const element = document.getElementById(item.id);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                        >
                            <div className="hero-icon-box">{item.icon}</div>
                            <span className="hero-icon-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
