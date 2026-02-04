import { useState, useEffect } from 'react';
import {
    User,
    ClipboardList,
    Bell,
    ChevronDown,
    Info,
    MapPin,
    Loader2,
    Eye,
    X,
} from 'lucide-react';
import '../../styles/pages/profile.css';
import userService from '../../api/userService';
import billService from '../../api/billService';
import { getCurrentUserId } from '../../utils/auth';
import { formatCurrency } from '../../utils/formatters';
import type { User as UserType } from '../../types/User';
import type { Bill } from '../../types/Bill';
import { toast } from 'react-toastify';

type TabType = 'profile' | 'orders' | 'addresses' | 'notifications' | 'password';

const ProfilePage = () => {
    const userId = getCurrentUserId();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [userData, setUserData] = useState<UserType | null>(null);
    const [orders, setOrders] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Bill | null>(null);
    const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

    // Form states
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    useEffect(() => {
        if (userId && activeTab === 'orders') {
            fetchOrders();
        }
    }, [userId, activeTab]);

    const fetchUserData = async () => {
        if (!userId) return;
        try {
            const response = await userService.getUserById(userId);
            if (response.result) {
                setUserData(response.result);
                setProfileForm({
                    firstName: response.result.firstName || '',
                    lastName: response.result.lastName || '',
                    email: response.result.email || '',
                    phone: response.result.phone || '',
                    dob: response.result.dob || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            toast.error('Không thể tải thông tin người dùng');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!userId) return;
        try {
            const response = await billService.getAllBills({ userId, size: 50 });
            if (response.result) {
                setOrders(response.result.content);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };


    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setIsProcessing(true);
        try {
            const response = await userService.updateUser(userId, {
                firstName: profileForm.firstName.trim(),
                lastName: profileForm.lastName.trim(),
                phone: profileForm.phone.trim(),
                dob: profileForm.dob,
            });
            if (response.result) {
                setUserData(response.result);
                toast.success('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsProcessing(true);
        try {
            // Backend update user allows password change
            const response = await userService.updateUser(userId!, {
                password: passwordForm.newPassword
            });
            if (response.result) {
                toast.success('Đổi mật khẩu thành công!');
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setActiveTab('profile');
            }
        } catch (error) {
            console.error('Change password error:', error);
            toast.error('Đổi mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleViewOrderDetails = async (orderId: number) => {
        setIsProcessing(true);
        try {
            const response = await billService.getBillById(orderId);
            if (response.result) {
                setSelectedOrder(response.result);
                setIsOrderDetailOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch bill details:', error);
            toast.error('Không thể lấy chi tiết đơn hàng');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="profile-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f0f0' }}>
                <Loader2 className="animate-spin" size={48} color="#C92127" />
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="shop-container">
                <div className="profile-layout">
                    {/* Sidebar */}
                    <aside className="profile-sidebar">
                        <div className="user-summary-card">
                            <div className="avatar-section-centered">
                                <div className="large-avatar-wrapper">
                                    <div className="avatar-circle">
                                        <User size={48} color="#ccd0d5" />
                                    </div>
                                </div>
                                <div className="user-info-centered">
                                    <h3>{userData?.firstName} {userData?.lastName}</h3>
                                </div>
                            </div>
                        </div>

                        <nav className="profile-nav">
                            <div className="nav-section">
                                <div className={`nav-item ${(activeTab === 'profile' || activeTab === 'addresses' || activeTab === 'password') ? 'active' : ''}`}>
                                    <div className="nav-item-header" onClick={() => setActiveTab('profile')}>
                                        <div className="nav-item-wrapper">
                                            <User size={20} />
                                            <span>Thông tin tài khoản</span>
                                        </div>
                                        <ChevronDown size={14} className="arrow" />
                                    </div>
                                    <div className="sub-nav">
                                        <div className={`sub-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Hồ sơ cá nhân</div>
                                        <div className={`sub-nav-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>Số địa chỉ</div>
                                        <div className={`sub-nav-item ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>Đổi mật khẩu</div>
                                    </div>
                                </div>
                                <div className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <ClipboardList size={20} />
                                            <span>Đơn hàng của tôi</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <Bell size={20} />
                                            <span>Thông báo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="profile-main">
                        {/* Membership Banner (Stats) */}
                        <div className="membership-banner">
                            <div className="banner-alert">
                                <Info size={16} />
                                <span>Chào mừng bạn quay lại, <b>{userData?.username}</b>!</span>
                            </div>
                            <div className="banner-content">
                                <div className="mascot-section">
                                    <div className="mascot-container">
                                        <img src="https://cdn0.fahasa.com/skin/frontend/ma_fahasa7/default/images/fahasa-mascot.png" alt="Mascot" />
                                    </div>
                                </div>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <h4>Thành tích mua sắm</h4>
                                        <div className="stat-items">
                                            <div className="stat-item">
                                                <span className="stat-label">Tổng số đơn hàng</span>
                                                <span className="stat-value highlight-blue">{orders.length} đơn hàng</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="profile-form-section">
                                <h2 className="section-title">Hồ sơ cá nhân</h2>
                                <form className="profile-form" onSubmit={handleUpdateProfile}>
                                    <div className="form-group-row">
                                        <label>Họ*</label>
                                        <input
                                            type="text"
                                            value={profileForm.firstName}
                                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                            placeholder="Nhập họ"
                                            required
                                        />
                                    </div>
                                    <div className="form-group-row">
                                        <label>Tên*</label>
                                        <input
                                            type="text"
                                            value={profileForm.lastName}
                                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                            placeholder="Nhập tên"
                                            required
                                        />
                                    </div>
                                    <div className="form-group-row">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="text"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div className="form-group-row">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            disabled
                                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                    <div className="form-group-row">
                                        <label>Ngày sinh</label>
                                        <input
                                            type="date"
                                            value={profileForm.dob ? profileForm.dob.split('T')[0] : ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                                            style={{ height: '36px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-save-profile" disabled={isProcessing}>
                                            {isProcessing ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div className="profile-form-section">
                                <h2 className="section-title">Đổi mật khẩu</h2>
                                <form className="profile-form" onSubmit={handleChangePassword}>
                                    <div className="form-group-row">
                                        <label>Mật khẩu mới*</label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            placeholder="Nhập mật khẩu mới"
                                            required
                                        />
                                    </div>
                                    <div className="form-group-row">
                                        <label>Xác nhận mật khẩu*</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            placeholder="Xác nhận mật khẩu mới"
                                            required
                                        />
                                    </div>
                                    <div className="form-actions" style={{ marginTop: '20px' }}>
                                        <button type="submit" className="btn-save-profile" disabled={isProcessing}>
                                            {isProcessing ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="profile-form-section">
                                <h2 className="section-title">Đơn hàng của tôi</h2>
                                <div className="orders-list">
                                    {orders.length === 0 ? (
                                        <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                                            <ClipboardList size={48} color="#ddd" style={{ marginBottom: '10px' }} />
                                            <p color="#666">Bạn chưa có đơn hàng nào.</p>
                                        </div>
                                    ) : (
                                        <div className="orders-table-wrapper" style={{ overflowX: 'auto' }}>
                                            <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>
                                                        <th style={{ padding: '12px' }}>Mã đơn</th>
                                                        <th style={{ padding: '12px' }}>Ngày mua</th>
                                                        <th style={{ padding: '12px' }}>Tổng tiền</th>
                                                        <th style={{ padding: '12px' }}>Trạng thái</th>
                                                        <th style={{ padding: '12px' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map(order => (
                                                        <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                            <td style={{ padding: '12px', fontWeight: 600 }}>#{order.id}</td>
                                                            <td style={{ padding: '12px' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '---'}</td>
                                                            <td style={{ padding: '12px', color: '#C92127', fontWeight: 700 }}>{formatCurrency(order.totalCost)}</td>
                                                            <td style={{ padding: '12px' }}>
                                                                <span className={`status-badge ${order.status.toLowerCase()}`} style={{
                                                                    fontSize: '11px',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '10px',
                                                                    backgroundColor: order.status === 'COMPLETED' ? '#e6f4ea' : '#fff8e1',
                                                                    color: order.status === 'COMPLETED' ? '#1e7e34' : '#f57c00'
                                                                }}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                                <button
                                                                    onClick={() => handleViewOrderDetails(order.id)}
                                                                    style={{ background: 'none', border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                                >
                                                                    <Eye size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                        {/* Addresses Placeholder */}
                        {activeTab === 'addresses' && (
                            <div className="profile-form-section">
                                <h2 className="section-title">Sổ địa chỉ</h2>
                                <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                                    <MapPin size={48} color="#ddd" style={{ marginBottom: '10px' }} />
                                    <p color="#666">Tính năng quản lý địa chỉ đang được phát triển.</p>
                                </div>
                            </div>
                        )}

                        {/* Notifications Placeholder */}
                        {activeTab === 'notifications' && (
                            <div className="profile-form-section">
                                <h2 className="section-title">Thông báo</h2>
                                <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                                    <Bell size={48} color="#ddd" style={{ marginBottom: '10px' }} />
                                    <p color="#666">Bạn chưa có thông báo nào.</p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Order Detail Modal */}
            {isOrderDetailOpen && selectedOrder && (
                <div className="modal-backdrop" onClick={() => setIsOrderDetailOpen(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
                            <button className="btn-close-modal" onClick={() => setIsOrderDetailOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail-info">
                                <div className="info-column">
                                    <h4>Thông tin khách hàng</h4>
                                    <div className="info-item">
                                        <span className="info-label">Người nhận:</span>
                                        <span className="info-value">{selectedOrder.fullName || selectedOrder.userName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Số điện thoại:</span>
                                        <span className="info-value">{selectedOrder.phone || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="info-column">
                                    <h4>Phương thức vận chuyển</h4>
                                    <div className="info-item">
                                        <span className="info-label">Hình thức:</span>
                                        <span className="info-value">{selectedOrder.shippingMethodName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phí vận chuyển:</span>
                                        <span className="info-value">{formatCurrency(selectedOrder.shippingCost)}</span>
                                    </div>
                                    <div className="info-item" style={{ marginTop: '12px' }}>
                                        <h4>Thanh toán</h4>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Hình thức:</span>
                                        <span className="info-value">{selectedOrder.paymentMethodName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Trạng thái:</span>
                                        <span className="info-value highlight-blue">{selectedOrder.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-books-section">
                                <h4>Sản phẩm đã mua</h4>
                                <table className="detail-books-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Đơn giá</th>
                                            <th>Số lượng</th>
                                            <th style={{ textAlign: 'right' }}>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.books?.map((book, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="detail-book-item">
                                                        <img src={book.bookImageUrl} alt={book.bookName} className="detail-book-img" />
                                                        <span className="detail-book-name">{book.bookName}</span>
                                                    </div>
                                                </td>
                                                <td>{formatCurrency(book.priceSnapshot)}</td>
                                                <td>{book.quantity}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                    {formatCurrency(book.subtotal || (book.priceSnapshot * book.quantity))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="detail-summary">
                                <div className="summary-row">
                                    <span>Tạm tính:</span>
                                    <span>{formatCurrency(selectedOrder.totalCost - selectedOrder.shippingCost)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Phí vận chuyển:</span>
                                    <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                                </div>
                                <div className="summary-row grand-total">
                                    <span>Tổng cộng:</span>
                                    <span>{formatCurrency(selectedOrder.totalCost)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal-primary" onClick={() => setIsOrderDetailOpen(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
