import { useState } from 'react';
import {
    User,
    ClipboardList,
    Ticket,
    Bell,
    Heart,
    BookOpen,
    Star,
    ChevronDown,
    ChevronRight,
    Info,
} from 'lucide-react';
import '../../styles/pages/profile.css';
import { mockUsers } from '../../data/mockUsers';

const ProfilePage = () => {
    const currentUser = mockUsers.find(u => u.username === 'customer1') || mockUsers[1];
    const [gender, setGender] = useState('male');

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
                                        <div className="crown-icon-placeholder">
                                            <Star size={32} fill="#ccd0d5" stroke="none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="user-info-centered">
                                    <h3>{currentUser.firstName} {currentUser.lastName}</h3>
                                    <span className="rank-badge-chip">Thành viên Bạc</span>
                                    <div className="fpoint-summary-centered">
                                        <p>F-Point tích lũy 0</p>
                                        <p className="next-rank-note">Thêm 30.000 để nâng hạng Vàng</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <nav className="profile-nav">
                            <div className="nav-section">
                                <div className="nav-item active">
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <User size={20} />
                                            <span>Thông tin tài khoản</span>
                                        </div>
                                        <ChevronDown size={14} className="arrow" />
                                    </div>
                                    <div className="sub-nav">
                                        <div className="sub-nav-item active">Hồ sơ cá nhân</div>
                                        <div className="sub-nav-item">Số địa chỉ</div>
                                        <div className="sub-nav-item">Đổi mật khẩu</div>
                                        <div className="sub-nav-item">Thông tin xuất hóa đơn GTGT</div>
                                        <div className="sub-nav-item">Ưu đãi thành viên</div>
                                    </div>
                                </div>
                                <div className="nav-item">
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <ClipboardList size={20} />
                                            <span>Đơn hàng của tôi</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="nav-item">
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <Ticket size={20} />
                                            <span>Ví voucher</span>
                                        </div>
                                        <span className="badge-count-red">18</span>
                                    </div>
                                </div>
                                <div className="nav-item">
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <div className="f-coin-icon">F</div>
                                            <span>Tài Khoản F-Point / Freeship</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="nav-item">
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <Bell size={20} />
                                            <span>Thông báo</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="nav-item">
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <Heart size={20} />
                                            <span>Sản phẩm yêu thích</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="nav-item">
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <BookOpen size={20} />
                                            <span>Sách theo bộ</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="nav-item">
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <Star size={20} />
                                            <span>Nhận xét của tôi</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="profile-main">
                        {/* Membership Banner */}
                        <div className="membership-banner">
                            <div className="banner-alert">
                                <Info size={16} />
                                <span>Bạn vui lòng cập nhật thông tin tài khoản:</span>
                                <button className="btn-update-now">Cập nhật thông tin ngay</button>
                            </div>
                            <div className="banner-content">
                                <div className="mascot-section">
                                    <div className="mascot-container">
                                        <img src="https://cdn0.fahasa.com/skin/frontend/ma_fahasa7/default/images/fahasa-mascot.png" alt="Mascot" />
                                    </div>
                                    <button className="btn-membership-status">Thành viên <ChevronRight size={14} /></button>
                                </div>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <h4>Ưu đãi của bạn</h4>
                                        <div className="stat-items">
                                            <div className="stat-item">
                                                <span className="stat-label">F-Point hiện có</span>
                                                <span className="stat-value">0</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Freeship hiện có</span>
                                                <span className="stat-value highlight">0 lần</span>
                                            </div>
                                        </div>
                                        <button className="btn-explore">Khám phá hạng thành viên. <span>Xem chi tiết</span></button>
                                    </div>
                                    <div className="stat-card">
                                        <h4>Thành tích năm 2025</h4>
                                        <div className="stat-items">
                                            <div className="stat-item">
                                                <span className="stat-label">Số đơn hàng</span>
                                                <span className="stat-value highlight-blue">0 đơn hàng</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Đã thanh toán</span>
                                                <span className="stat-value highlight-blue">0 đ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="profile-form-section">
                            <h2 className="section-title">Hồ sơ cá nhân</h2>
                            <form className="profile-form">
                                <div className="form-group-row">
                                    <label>Họ*</label>
                                    <input type="text" defaultValue={currentUser.firstName} placeholder="Nhập họ" />
                                </div>
                                <div className="form-group-row">
                                    <label>Tên*</label>
                                    <input type="text" defaultValue={currentUser.lastName} placeholder="Nhập tên" />
                                </div>
                                <div className="form-group-row">
                                    <label>Số điện thoại</label>
                                    <div className="input-with-action">
                                        <input type="text" defaultValue={currentUser.phone} placeholder="Nhập số điện thoại" />
                                        <button type="button" className="btn-inline-action">Thay đổi</button>
                                    </div>
                                </div>
                                <div className="form-group-row">
                                    <label>Email</label>
                                    <div className="input-with-action">
                                        <input type="email" defaultValue={currentUser.email} placeholder="Chưa có email" />
                                        <button type="button" className="btn-inline-action">Thêm mới</button>
                                    </div>
                                </div>
                                <div className="form-group-row">
                                    <label>Giới tính*</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                checked={gender === 'male'}
                                                onChange={() => setGender('male')}
                                            />
                                            <span className="radio-custom"></span>
                                            Nam
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                checked={gender === 'female'}
                                                onChange={() => setGender('female')}
                                            />
                                            <span className="radio-custom"></span>
                                            Nữ
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group-row">
                                    <label>Birthday*</label>
                                    <div className="date-inputs">
                                        <input type="text" placeholder="04" className="date-input" />
                                        <input type="text" placeholder="07" className="date-input" />
                                        <input type="text" placeholder="2004" className="date-input-year" />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-save-profile">Lưu thay đổi</button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
