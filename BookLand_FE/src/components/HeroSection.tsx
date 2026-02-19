import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/components/hero-section.css';

const HeroSection = () => {
    return (
        <section className="hero-section">
            <div className="hero-container">
                {/* Top Row: Main Slider + Side Banners */}
                <div className="hero-top-row">
                    <div className="hero-main-slider">
                        <Link to="/shop/category/featured" className="hero-slider-item" style={{ backgroundColor: '#C92127', display: 'flex' }}>
                            <div className="hero-slider-placeholder">Main Slider Banner</div>
                        </Link>
                        <div className="hero-slider-nav">
                            <button className="hero-slider-arrow prev"><ChevronLeft size={24} /></button>
                            <button className="hero-slider-arrow next"><ChevronRight size={24} /></button>
                        </div>
                        <div className="hero-slider-dots">
                            <span className="dot active"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                    <div className="hero-side-banners">
                        <Link to="/shop/category/sale" className="hero-side-banner" style={{ backgroundColor: '#AEEEEE', textDecoration: 'none' }}>
                            Side Banner 1
                        </Link>
                        <Link to="/shop/category/new" className="hero-side-banner" style={{ backgroundColor: '#FFD39B', textDecoration: 'none' }}>
                            Side Banner 2
                        </Link>
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
