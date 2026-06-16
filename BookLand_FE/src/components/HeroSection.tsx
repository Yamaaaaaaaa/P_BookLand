import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/components/hero-section.css';
import { useEffect, useState } from 'react';

import { eventService } from '../api/eventService';
import categoryService from '../api/categoryService';
import homeService from '../api/homeService';
import settingService from '../api/settingService';
import type { Category } from '../types/Category';
import type { HomeSection } from '../types/HomeSection';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [eventId, setEventId] = useState<number | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [imgLoading, setImgLoading] = useState(true);
    const [pinnedCategories, setPinnedCategories] = useState<Category[]>([]);
    const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
    const [sideBanners, setSideBanners] = useState({ banner1: '', banner2: '' });
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await eventService.getHighestPriorityEvent();
                if (response.result) {
                    setEventId(response.result.id);
                    const images = response.result.images || [];
                    const sorted = [...images].sort((a, b) => {
                        if (a.imageType === 'MAIN') return -1;
                        if (b.imageType === 'MAIN') return 1;
                        return 0;
                    });
                    setImageUrls(sorted.map(img => img.imageUrl));
                }
            } catch (error) {
                console.error("Failed to fetch priority event", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchPinnedCategories = async () => {
            try {
                const res = await categoryService.getAll({ size: 4, pinned: true });
                if (res.result && res.result.content) {
                    setPinnedCategories(res.result.content);
                }
            } catch (error) {
                console.error("Failed to fetch pinned categories", error);
            }
        };

        const fetchHomeSections = async () => {
            try {
                const res = await homeService.getHomeSections();
                if (res.result && res.result.length > 0) {
                    setHomeSections(res.result.filter(s => s.visible));
                }
            } catch (error) {
                console.error("Failed to fetch home sections", error);
            }
        };

        const fetchSettings = async () => {
            try {
                const res = await settingService.getAllSettings();
                if (res.result) {
                    setSideBanners({
                        banner1: res.result['home_side_banner_1'] || '',
                        banner2: res.result['home_side_banner_2'] || ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };

        fetchEvent();
        fetchPinnedCategories();
        fetchHomeSections();
        fetchSettings();
    }, []);

    const nextSlide = () => {
        setImgLoading(true);
        setCurrentSlide((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setImgLoading(true);
        setCurrentSlide((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
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
                        ) : imageUrls.length > 0 ? (
                            <>
                                <Link
                                    to={eventId ? `/shop/event-detail/${eventId}` : '#'}
                                    className="hero-slider-item"
                                    style={{ position: 'relative', overflow: 'hidden', display: 'block', cursor: eventId ? 'pointer' : 'default' }}
                                >
                                    {imgLoading && (
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: '#f0f0f0', zIndex: 1
                                        }}>
                                            <div style={{
                                                border: '4px solid #f3f3f3',
                                                borderTop: '4px solid #C92127',
                                                borderRadius: '50%',
                                                width: '40px', height: '40px',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                        </div>
                                    )}
                                    <img
                                        key={currentSlide}
                                        src={imageUrls[currentSlide]}
                                        alt={`Slide ${currentSlide + 1}`}
                                        onLoad={() => setImgLoading(false)}
                                        onError={() => setImgLoading(false)}
                                        style={{
                                            width: '100%',
                                            height: '360px',
                                            objectFit: 'cover',
                                            display: 'block',
                                            opacity: imgLoading ? 0 : 1,
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    />
                                </Link>
                                <div className="hero-slider-nav">
                                    <button className="hero-slider-arrow prev" onClick={e => { e.preventDefault(); prevSlide(); }}><ChevronLeft size={24} /></button>
                                    <button className="hero-slider-arrow next" onClick={e => { e.preventDefault(); nextSlide(); }}><ChevronRight size={24} /></button>
                                </div>
                                <div className="hero-slider-dots">
                                    {imageUrls.map((_, index) => (
                                        <span
                                            key={index}
                                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                                            onClick={() => { setImgLoading(true); setCurrentSlide(index); }}
                                        ></span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Link 
                                to="/shop/category/featured" 
                                className="hero-slider-item" 
                                style={{ 
                                    backgroundColor: '#C92127', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    textDecoration: 'none',
                                    color: '#ffffff',
                                    padding: '24px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <div className="hero-slider-empty-content" style={{ textAlign: 'center' }}>
                                    <div className="hero-slider-empty-icon" style={{ fontSize: '64px', marginBottom: '12px', animation: 'eventIconPulse 2s infinite' }}>🎁</div>
                                    <h3 className="hero-slider-empty-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: '#ffffff' }}>Thông báo sự kiện</h3>
                                    <p className="hero-slider-empty-desc" style={{ fontSize: '15px', margin: 0, opacity: 0.95, color: '#ffffff', fontWeight: 500 }}>
                                        Hiện không có sự kiện nào, hãy đón chờ nhé!
                                    </p>
                                </div>
                            </Link>
                        )}
                    </div>
                    <div className="hero-side-banners">
                        <div className="hero-side-banner">
                            <img src={sideBanners.banner1 || "/momo.png"} alt="Banner 1" />
                        </div>
                        <div className="hero-side-banner">
                            <img src={sideBanners.banner2 || "/vn-pay.png"} alt="Banner 2" />
                        </div>
                    </div>
                </div>

                <div className="hero-promo-banners">
                    {pinnedCategories.length > 0 ? (
                        pinnedCategories.map(cat => (
                            <Link key={cat.id} to={`/shop/books?category=${cat.id}`} className="hero-promo-banner" style={{ padding: 0 }}>
                                <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} />
                            </Link>
                        ))
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

                {/* Bottom Row: Icon Menu - Dynamic */}
                <div className="hero-icon-menu">
                    {(homeSections.length > 0 ? homeSections : [
                        { id: 0, sectionKey: 'super_sale', nameVi: t('home.hero.super_sale'), nameEn: 'Super Sale', icon: '⚡', anchorId: 'super-sale-section', displayOrder: 1, visible: true },
                        { id: 0, sectionKey: 'trending', nameVi: t('home.hero.trending'), nameEn: 'Trending', icon: '📈', anchorId: 'trending-section', displayOrder: 2, visible: true },
                        { id: 0, sectionKey: 'featured', nameVi: t('home.hero.featured'), nameEn: 'Featured', icon: '🌟', anchorId: 'featured-section', displayOrder: 3, visible: true },
                        { id: 0, sectionKey: 'best_seller', nameVi: t('home.hero.best_seller'), nameEn: 'Best Sellers', icon: '🏆', anchorId: 'bestseller-section', displayOrder: 4, visible: true },
                        { id: 0, sectionKey: 'recommend', nameVi: t('home.hero.recommend'), nameEn: 'Recommendations', icon: '💡', anchorId: 'recommendation-section', displayOrder: 5, visible: true },
                    ]).map((section, index) => (
                        <div
                            key={section.sectionKey || index}
                            className="hero-icon-item"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                const element = document.getElementById(section.anchorId);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                        >
                            <div className="hero-icon-box">{section.icon}</div>
                            <span className="hero-icon-label">
                                {i18n.language === 'vi' ? section.nameVi : section.nameEn}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
