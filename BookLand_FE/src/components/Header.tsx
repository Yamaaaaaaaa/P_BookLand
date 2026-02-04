import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Bell, User, Menu, X, ChevronDown, LayoutGrid } from 'lucide-react';
import '../styles/components/header.css';
import { categories, notifications, userMenuItems, mockUser } from '../../mockNewUI/headerMockData';

interface HeaderProps {
    onLogout: () => void;
    cartItemCount?: number;
    isAuthenticated: boolean;
}

const Header = ({ onLogout, cartItemCount = 3, isAuthenticated }: HeaderProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const categoryMenuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
                setIsCategoryMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <header className="new-header">
            <div className="new-header__container">
                {/* Top Bar */}
                <div className="new-header__top">
                    {/* Mobile Menu Button */}
                    <button
                        className="new-header__mobile-menu-btn"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <Link to="/shop/home" className="new-header__logo">
                        Fahasa.c<span className="new-header__logo-om">Ỏ</span>m
                    </Link>

                    {/* Search Group (Category + Search) */}
                    <div className="new-header__search-group">
                        <div className="new-header__category-wrapper" ref={categoryMenuRef}>
                            <button
                                className="new-header__category-btn"
                                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                                aria-label="Danh mục sản phẩm"
                            >
                                <LayoutGrid size={28} color="#7A7E7F" strokeWidth={1.5} />
                                <ChevronDown size={16} color="#7A7E7F" style={{ marginLeft: 2 }} />
                            </button>

                            {/* Category Mega Menu */}
                            {isCategoryMenuOpen && (
                                <div className="new-header__mega-menu">
                                    {/* Left Sidebar - Categories */}
                                    <div className="new-header__mega-menu-sidebar">
                                        <h3 className="new-header__mega-menu-title">Danh mục sản phẩm</h3>
                                        <div className="new-header__mega-menu-categories">
                                            {categories.map((category) => (
                                                <Link
                                                    key={category.id}
                                                    to={`/shop/category/${category.id}`}
                                                    className="new-header__mega-menu-category"
                                                >
                                                    {category.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Panel - Featured Content */}
                                    <div className="new-header__mega-menu-content">
                                        <div className="new-header__mega-menu-header">
                                            <div className="new-header__mega-menu-badge">
                                                <span className="new-header__mega-menu-badge-icon">📚</span>
                                                <span className="new-header__mega-menu-badge-text">Sách Trong Nước</span>
                                            </div>
                                        </div>

                                        <div className="new-header__mega-menu-grid">
                                            {/* VĂN HỌC */}
                                            <div className="new-header__mega-menu-section">
                                                <h4 className="new-header__mega-menu-section-title">VĂN HỌC</h4>
                                                <Link to="/category/tieu-thuyet" className="new-header__mega-menu-link">Tiểu Thuyết</Link>
                                                <Link to="/category/truyen-ngan" className="new-header__mega-menu-link">Truyện Ngắn - Tản Văn</Link>
                                                <Link to="/category/light-novel" className="new-header__mega-menu-link">Light Novel</Link>
                                                <Link to="/category/ngon-tinh" className="new-header__mega-menu-link">Ngôn Tình</Link>
                                                <Link to="/category/van-hoc" className="new-header__mega-menu-link-all">Xem tất cả</Link>
                                            </div>

                                            {/* KINH TẾ */}
                                            <div className="new-header__mega-menu-section">
                                                <h4 className="new-header__mega-menu-section-title">KINH TẾ</h4>
                                                <Link to="/category/nhan-vat" className="new-header__mega-menu-link">Nhân Vật - Bài Học Kinh Doanh</Link>
                                                <Link to="/category/quan-tri" className="new-header__mega-menu-link">Quản Trị - Lãnh Đạo</Link>
                                                <Link to="/category/marketing" className="new-header__mega-menu-link">Marketing - Bán Hàng</Link>
                                                <Link to="/category/phan-tich" className="new-header__mega-menu-link">Phân Tích Kinh Tế</Link>
                                                <Link to="/category/kinh-te" className="new-header__mega-menu-link-all">Xem tất cả</Link>
                                            </div>

                                            {/* TÂM LÝ - KỸ NĂNG SỐNG */}
                                            <div className="new-header__mega-menu-section">
                                                <h4 className="new-header__mega-menu-section-title">TÂM LÝ - KỸ NĂNG SỐNG</h4>
                                                <Link to="/category/ky-nang" className="new-header__mega-menu-link">Kỹ Năng Sống</Link>
                                                <Link to="/category/ren-luyen" className="new-header__mega-menu-link">Rèn Luyện Nhân Cách</Link>
                                                <Link to="/category/tam-ly" className="new-header__mega-menu-link">Tâm Lý</Link>
                                                <Link to="/category/tuoi-moi-lon" className="new-header__mega-menu-link">Sách Cho Tuổi Mới Lớn</Link>
                                                <Link to="/category/tam-ly-ky-nang" className="new-header__mega-menu-link-all">Xem tất cả</Link>
                                            </div>

                                            {/* NUÔI DẠY CON */}
                                            <div className="new-header__mega-menu-section">
                                                <h4 className="new-header__mega-menu-section-title">NUÔI DẠY CON</h4>
                                                <Link to="/category/cam-nang" className="new-header__mega-menu-link">Cẩm Nang Làm Cha Mẹ</Link>
                                                <Link to="/category/phuong-phap" className="new-header__mega-menu-link">Phương Pháp Giáo Dục Trẻ ...</Link>
                                                <Link to="/category/tri-tue" className="new-header__mega-menu-link">Phát Triển Trí Tuệ Cho Trẻ</Link>
                                                <Link to="/category/ky-nang-tre" className="new-header__mega-menu-link">Phát Triển Kỹ Năng Cho Trẻ</Link>
                                                <Link to="/category/nuoi-day-con" className="new-header__mega-menu-link-all">Xem tất cả</Link>
                                            </div>

                                            {/* SÁCH THIẾU NHI */}
                                            <div className="new-header__mega-menu-section">
                                                <h4 className="new-header__mega-menu-section-title">SÁCH THIẾU NHI</h4>
                                                <Link to="/category/manga" className="new-header__mega-menu-link">Manga - Comic</Link>
                                                <Link to="/category/bach-khoa" className="new-header__mega-menu-link">Kiến Thức Bách Khoa</Link>
                                                <Link to="/category/tranh-ky-nang" className="new-header__mega-menu-link">Sách Tranh Kỹ Năng Sống C...</Link>
                                                <Link to="/category/vua-hoc" className="new-header__mega-menu-link">Vừa Học - Vừa Học Vừa Cho...</Link>
                                                <Link to="/category/thieu-nhi" className="new-header__mega-menu-link-all">Xem tất cả</Link>
                                            </div>

                                            {/* TIỂU SỬ - HỒI KÝ */}
                                            <div className="new-header__mega-menu-section">
                                                <h4 className="new-header__mega-menu-section-title">TIỂU SỬ - HỒI KÝ</h4>
                                                <Link to="/category/cau-chuyen" className="new-header__mega-menu-link">Các Chuyện Cuộc Đời</Link>
                                                <Link to="/category/chinh-tri" className="new-header__mega-menu-link">Chính Trị</Link>
                                                <Link to="/category/kinh-te-ts" className="new-header__mega-menu-link">Kinh Tế</Link>
                                                <Link to="/category/nghe-thuat" className="new-header__mega-menu-link">Nghệ Thuật - Giải Trí</Link>
                                                <Link to="/category/tieu-su" className="new-header__mega-menu-link-all">Xem tất cả</Link>
                                            </div>

                                            {/* GIÁO KHOA - THAM KHẢO */}
                                            <div className="new-header__mega-menu-section">
                                                <h4 className="new-header__mega-menu-section-title">GIÁO KHOA - THAM KHẢO</h4>
                                                <Link to="/category/giao-khoa" className="new-header__mega-menu-link">Sách Giáo Khoa</Link>
                                                <Link to="/category/tham-khao" className="new-header__mega-menu-link">Sách Tham Khảo</Link>
                                                <Link to="/category/luyen-thi" className="new-header__mega-menu-link">Luyện Thi THPT Quốc Gia</Link>
                                                <Link to="/category/mau-giao" className="new-header__mega-menu-link">Mẫu Giáo</Link>
                                                <Link to="/category/giao-khoa-tk" className="new-header__mega-menu-link-all">Xem tất cả</Link>
                                            </div>

                                            {/* SÁCH HỌC NGOẠI NGỮ */}
                                            <div className="new-header__mega-menu-section">
                                                <h4 className="new-header__mega-menu-section-title">SÁCH HỌC NGOẠI NGỮ</h4>
                                                <Link to="/category/tieng-anh" className="new-header__mega-menu-link">Tiếng Anh</Link>
                                                <Link to="/category/tieng-nhat" className="new-header__mega-menu-link">Tiếng Nhật</Link>
                                                <Link to="/category/tieng-hoa" className="new-header__mega-menu-link">Tiếng Hoa</Link>
                                                <Link to="/category/tieng-han" className="new-header__mega-menu-link">Tiếng Hàn</Link>
                                                <Link to="/category/ngoai-ngu" className="new-header__mega-menu-link-all">Xem tất cả</Link>
                                            </div>
                                        </div>

                                        {/* Bottom Highlights */}
                                        <div className="new-header__mega-menu-footer">
                                            <Link to="/category/sach-moi" className="new-header__mega-menu-highlight">SÁCH MỚI ♥</Link>
                                            <Link to="/category/sach-ban-chay" className="new-header__mega-menu-highlight">SÁCH BÁN CHẠY ♥</Link>
                                            <Link to="/category/manga-moi" className="new-header__mega-menu-highlight">MANGA MỚI ♥</Link>
                                            <Link to="/category/light-novel-moi" className="new-header__mega-menu-highlight">LIGHT NOVEL MỚI ♥</Link>
                                            <Link to="/category/dam-my-moi" className="new-header__mega-menu-highlight">ĐAM MỸ MỚI ♥</Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="new-header__search">
                            <input
                                type="text"
                                className="new-header__search-input"
                                placeholder="Boxset Kinh Văn Hoa"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="new-header__search-btn" aria-label="Search">
                                <Search size={20} color="white" />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="new-header__actions">
                        {/* Notification Bell */}
                        <div className="new-header__notification-wrapper" ref={notificationRef}>
                            <button
                                className="new-header__icon-btn"
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                aria-label="Notifications"
                            >
                                <Bell size={20} />
                                {unreadNotifications > 0 && (
                                    <span className="new-header__badge">{unreadNotifications}</span>
                                )}
                                <span className="new-header__icon-label">Thông Báo</span>
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <div className="new-header__notification-dropdown">
                                    <div className="new-header__notification-header">
                                        <h3>Thông báo ({unreadNotifications})</h3>
                                        <Link to="/shop/notifications" className="new-header__view-all">
                                            Xem tất cả
                                        </Link>
                                    </div>
                                    <div className="new-header__notification-list">
                                        {isAuthenticated ? (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`new-header__notification-item ${!notification.read ? 'new-header__notification-item--unread' : ''}`}
                                                >
                                                    <div className="new-header__notification-icon">
                                                        <Bell size={16} />
                                                    </div>
                                                    <div className="new-header__notification-content">
                                                        <h4>{notification.title}</h4>
                                                        <p>{notification.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="new-header__notification-empty">
                                                <div className="new-header__notification-lock">
                                                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                                        <circle cx="32" cy="32" r="32" fill="#F0F0F0" />
                                                        <path d="M32 20C28.686 20 26 22.686 26 26V30H24C22.895 30 22 30.895 22 32V42C22 43.105 22.895 44 24 44H40C41.105 44 42 43.105 42 42V32C42 30.895 41.105 30 40 30H38V26C38 22.686 35.314 20 32 20ZM32 22C34.206 22 36 23.794 36 26V30H28V26C28 23.794 29.794 22 32 22Z" fill="#999" />
                                                    </svg>
                                                </div>
                                                <p className="new-header__notification-empty-text">Vui lòng đăng nhập để xem thông báo</p>
                                                <div className="new-header__notification-actions">
                                                    <Link to="/shop/login" className="new-header__notification-login-btn">
                                                        Đăng nhập
                                                    </Link>
                                                    <Link to="/shop/register" className="new-header__notification-register-btn">
                                                        Đăng ký
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cart */}
                        <Link to="/shop/cart" className="new-header__icon-btn">
                            <ShoppingCart size={20} />
                            {cartItemCount > 0 && (
                                <span className="new-header__badge">{cartItemCount}</span>
                            )}
                            <span className="new-header__icon-label">Giỏ Hàng</span>
                        </Link>

                        {/* User Account */}
                        <div className="new-header__user-wrapper" ref={userMenuRef}>
                            <button
                                className="new-header__user-btn"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <User size={20} />
                                <span className="new-header__icon-label">Tài khoản</span>
                            </button>

                            {/* User Menu Dropdown */}
                            {isUserMenuOpen && (
                                <div className="new-header__user-dropdown">
                                    {isAuthenticated ? (
                                        <>
                                            <Link to="/shop/profile" className="new-header__user-info" onClick={() => setIsUserMenuOpen(false)}>
                                                <div className="new-header__user-avatar">
                                                    <User size={24} />
                                                </div>
                                                <div className="new-header__user-details">
                                                    <h4>{mockUser.name}</h4>
                                                    <p>{mockUser.role}</p>
                                                </div>
                                            </Link>
                                            <div className="new-header__user-menu-list">
                                                {userMenuItems.map((item) => (
                                                    item.id === 'logout' ? (
                                                        <button
                                                            key={item.id}
                                                            onClick={onLogout}
                                                            className="new-header__user-menu-item"
                                                        >
                                                            <span className="new-header__user-menu-icon">{item.icon}</span>
                                                            <span>{item.label}</span>
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            key={item.id}
                                                            to={item.href}
                                                            className="new-header__user-menu-item"
                                                        >
                                                            <span className="new-header__user-menu-icon">{item.icon}</span>
                                                            <span>{item.label}</span>
                                                        </Link>
                                                    )
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="new-header__auth-dropdown-content">
                                            <Link to="/shop/login" className="new-header__auth-dropdown-btn new-header__auth-dropdown-btn--login">
                                                Đăng nhập
                                            </Link>
                                            <Link to="/shop/register" className="new-header__auth-dropdown-btn new-header__auth-dropdown-btn--register">
                                                Đăng ký
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Language Switcher */}
                        <div className="new-header__lang-selector">
                            <span style={{ fontSize: '20px' }}>🇻🇳</span>
                            <ChevronDown size={14} color="#7A7E7F" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="new-header__mobile-overlay" onClick={closeMobileMenu} />
            )}

            {/* Mobile Menu */}
            <div className={`new-header__mobile-menu ${isMobileMenuOpen ? 'new-header__mobile-menu--open' : ''}`}>
                <div className="new-header__mobile-header">
                    <h3>Danh Mục Sản Phẩm</h3>
                    <button onClick={closeMobileMenu} className="new-header__mobile-close">
                        <X size={24} />
                    </button>
                </div>

                <div className="new-header__mobile-category-list">
                    {categories.map((category) => (
                        <div key={category.id} className="new-header__mobile-category-item">
                            <Link
                                to={`/shop/category/${category.id}`}
                                className="new-header__mobile-category-link"
                                onClick={closeMobileMenu}
                            >
                                {category.icon && <span className="new-header__mobile-category-icon">{category.icon}</span>}
                                <span>{category.name}</span>
                                {category.subcategories && <ChevronDown size={16} />}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;
