import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/components/hero-section.css';
import { useEffect, useState } from 'react';
import type { Event } from '../types/Event';
import { eventService } from '../api/eventService';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
    const [event, setEvent] = useState<Event | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

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

        fetchEvent();
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
                        <div className="hero-side-banner" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
                            <img src="/momo.png" alt="Momo" style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                        </div>
                        <div className="hero-side-banner" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
                            <img src="/vn-pay.png" alt="VNPay" style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                        </div>
                    </div>
                </div>

                <div className="hero-promo-banners">
                    <Link to="/shop/books?category=4" className="hero-promo-banner" style={{ padding: 0 }}>
                        <img src="/sach_giao_khoa.png" alt="Sách giáo khoa" style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} />
                    </Link>
                    <Link to="/shop/books?category=1" className="hero-promo-banner" style={{ padding: 0 }}>
                        <img src="/tieu_thuyet_gia_tuong.png" alt="Tiểu thuyết giả tưởng" style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} />
                    </Link>
                    <Link to="/shop/books?category=2" className="hero-promo-banner" style={{ padding: 0 }}>
                        <img src="/truyen-tranh.png" alt="Truyện tranh" style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} />
                    </Link>
                    <Link to="/shop/books?category=3" className="hero-promo-banner" style={{ padding: 0 }}>
                        <img src="/van_hoc_thieu_nhi.png" alt="Văn học thiếu nhi" style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} />
                    </Link>
                </div>

                {/* Bottom Row: Icon Menu */}
                <div className="hero-icon-menu">
                    {[
                        { label: t('home.hero.super_sale'), icon: '⚡', id: 'super-sale-section' },
                        { label: t('home.hero.trending'), icon: '📈', id: 'trending-section' },
                        { label: t('home.hero.featured'), icon: '🌟', id: 'featured-section' },
                        { label: t('home.hero.best_seller'), icon: '🏆', id: 'bestseller-section' },
                        { label: t('home.hero.recommend'), icon: '💡', id: 'recommendation-section' },
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
