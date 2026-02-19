import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Bell, User, Menu, X, ChevronDown, LayoutGrid } from 'lucide-react';
import '../styles/components/header.css';
import { categories, userMenuItems, mockUser } from '../../mockNewUI/headerMockData';
import notificationService from '../api/notificationService';
import { getCurrentUserId } from '../utils/auth';
import type { Notification } from '../types/Notification';
import { toast } from 'react-toastify';
import { useWebSocket } from '../context/WebSocketContext';
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
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const navigate = useNavigate();
    const userId = getCurrentUserId();
    const { subscribe, isConnected } = useWebSocket();

    const categoryMenuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Fetch unread count and set up polling/click logic
    useEffect(() => {
        if (userId && isAuthenticated) {
            fetchUnreadCount();
        }
    }, [userId, isAuthenticated]);

    const isNotificationOpenRef = useRef(isNotificationOpen);

    useEffect(() => {
        isNotificationOpenRef.current = isNotificationOpen;
    }, [isNotificationOpen]);

    // WebSocket subscription for real-time notifications
    useEffect(() => {
        if (isConnected && userId && isAuthenticated) {
            console.log('Registering WebSocket subscription for notifications...');
            const unsubscribe = subscribe(`/user/queue/notifications`, (message) => {
                try {
                    const newNotification: Notification = JSON.parse(message.body);
                    console.log('Received new notification via WebSocket:', newNotification);

                    setNotificationsList(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // If it's a bill status notification, refresh the count from server
                    if (newNotification.type === 'BILL_STATUS') {
                        fetchUnreadCount();
                    }

                    if (!isNotificationOpenRef.current) {
                        toast.info(
                            <div>
                                <h4 style={{ margin: 0, fontSize: '14px' }}>{newNotification.title}</h4>
                                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>{newNotification.content}</p>
                            </div>,
                            {
                                icon: <span>🔔</span>,
                                onClick: () => {
                                    handleToggleNotification();
                                }
                            }
                        );
                    }
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            });
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [isConnected, userId, isAuthenticated]);

    const fetchUnreadCount = async () => {
        if (!userId) return;
        try {
            const response = await notificationService.getUnreadCount(userId);
            if (response.code === 1000) {
                setUnreadCount(response.result);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        if (!userId || isLoadingNotifications) return;
        setIsLoadingNotifications(true);
        try {
            const response = await notificationService.getNotifications(userId, 0, 100);

            // Log to debug if needed (user reported toast.error even with data)
            console.log('Notification API Response:', response);

            if (response && response.code === 1000) {
                if (response.result && response.result.content) {
                    setNotificationsList(response.result.content);
                } else {
                    setNotificationsList([]);
                }
            } else {
                console.error('API returned non-1000 code:', response?.code);
                toast.error('Không thể tải thông báo');
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Không thể tải thông báo');
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const handleToggleNotification = () => {
        const nextState = !isNotificationOpen;
        setIsNotificationOpen(nextState);
        if (nextState && isAuthenticated) {
            fetchNotifications();
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            const response = await notificationService.markAsRead(id);
            if (response.code === 1000) {
                // Update local state to show as read
                setNotificationsList(prev =>
                    prev.map(n => n.id === id ? { ...n, status: 'READ' } : n)
                );
                // Refresh unread count
                fetchUnreadCount();
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) return;
        try {
            const response = await notificationService.markAllAsRead(userId);
            if (response.code === 1000) {
                setNotificationsList(prev => prev.map(n => ({ ...n, status: 'READ' })));
                setUnreadCount(0);
                toast.success('Đã đọc tất cả thông báo');
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDeleteAllRead = async () => {
        if (!userId) return;
        try {
            const response = await notificationService.deleteAllReadNotifications(userId);
            if (response.code === 1000) {
                setNotificationsList(prev => prev.filter(n => n.status === 'UNREAD'));
                toast.success('Đã xóa tất cả thông báo đã đọc');
            }
        } catch (error) {
            console.error('Failed to delete all read notifications:', error);
            toast.error('Không thể xóa thông báo');
        }
    };

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

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop/books?keyword=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/shop/books');
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };


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
                    {/* Logo */}
                    <Link to="/shop/home" className="new-header__logo" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/logo.png" alt="BookLand" style={{ height: '40px', width: 'auto' }} />
                    </Link>

                    {/* Search Group (Category + Search) */}
                    <div className="new-header__search-group">
                        <div className="new-header__category-wrapper" ref={categoryMenuRef}>
                            <button
                                className="new-header__category-btn"
                                onClick={() => navigate('/shop/books')}
                            >
                                <LayoutGrid size={28} color="#7A7E7F" strokeWidth={1.5} />
                                {/* <ChevronDown size={16} color="#7A7E7F" style={{ marginLeft: 2 }} /> */}
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

                        <form className="new-header__search" onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                className="new-header__search-input"
                                placeholder="Boxset Kinh Văn Hoa"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="new-header__search-btn" type="submit" aria-label="Search">
                                <Search size={20} color="white" />
                            </button>
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="new-header__actions">
                        {/* Notification Bell */}
                        <div className="new-header__notification-wrapper" ref={notificationRef}>
                            <button
                                className="new-header__icon-btn"
                                onClick={handleToggleNotification}
                                aria-label="Notifications"
                            >
                                <Bell size={20} />
                                {isAuthenticated && unreadCount > 0 && (
                                    <span className="new-header__badge">{unreadCount}</span>
                                )}
                                <span className="new-header__icon-label">Thông Báo</span>
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <div className="new-header__notification-dropdown">
                                    <div className="new-header__notification-header">
                                        <h3>Thông báo ({isAuthenticated ? unreadCount : 0})</h3>
                                        <div className="new-header__notification-header-actions">
                                            {isAuthenticated && unreadCount > 0 && (
                                                <button onClick={handleMarkAllAsRead} className="new-header__mark-all">
                                                    Đọc tất cả
                                                </button>
                                            )}
                                            {isAuthenticated && notificationsList.some(n => n.status === 'READ') && (
                                                <button onClick={handleDeleteAllRead} className="new-header__delete-all">
                                                    Xóa đã đọc
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="new-header__notification-list">
                                        {isAuthenticated ? (
                                            isLoadingNotifications ? (
                                                <div className="new-header__notification-loading">
                                                    <div className="spinner"></div>
                                                    <p>Đang tải thông báo...</p>
                                                </div>
                                            ) : notificationsList.length > 0 ? (
                                                notificationsList.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`new-header__notification-item ${notification.status === 'UNREAD' ? 'new-header__notification-item--unread' : ''}`}
                                                        onClick={() => {
                                                            if (notification.status === 'UNREAD') handleMarkAsRead(notification.id);
                                                            // Optional: navigate based on notification type
                                                            // navigate('/some-path');
                                                        }}
                                                    >
                                                        <div className="new-header__notification-icon">
                                                            <Bell size={16} />
                                                        </div>
                                                        <div className="new-header__notification-content">
                                                            <h4>{notification.title}</h4>
                                                            <p>{notification.content}</p>
                                                            <span className="new-header__notification-time">
                                                                {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="new-header__notification-empty">
                                                    <p>Không có thông báo mới nào</p>
                                                </div>
                                            )
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
            {
                isMobileMenuOpen && (
                    <div className="new-header__mobile-overlay" onClick={closeMobileMenu} />
                )
            }

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
        </header >
    );
};

export default Header;
