import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutAdmin, getAdminRefreshToken } from '../utils/auth';
import authService from '../api/authService';
import { LayoutDashboard, Users, CreditCard, Truck, Calendar, Book, Layers, Hash, LogOut, Receipt, ImageIcon, MessageCircle, Shield } from 'lucide-react';
import '../styles/layouts/admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        const refreshToken = getAdminRefreshToken();
        if (refreshToken) {
            try {
                await authService.logout({ token: refreshToken });
            } catch (error) {
                console.error("Logout failed", error);
            }
        }
        logoutAdmin();
        navigate('/admin/login');
    };

    const isActive = (path: string) => location.pathname.includes(path);

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-logo">BookLand Admin</div>
                </div>

                <nav className="admin-nav">
                    <div className="admin-nav-group">
                        <div className="admin-nav-title">Overview</div>
                        <Link to="/admin/dashboard" className={`admin-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                            <LayoutDashboard /> Dashboard
                        </Link>
                    </div>

                    <div className="admin-nav-group">
                        <div className="admin-nav-title">Business</div>
                        <Link to="/admin/manage-business/bills" className={`admin-nav-item ${isActive('/bills') ? 'active' : ''}`}>
                            <Receipt /> Orders & Bills
                        </Link>
                        <Link to="/admin/manage-business/payment-method" className={`admin-nav-item ${isActive('/payment-method') ? 'active' : ''}`}>
                            <CreditCard /> Payment Methods
                        </Link>
                        <Link to="/admin/manage-business/shipping-method" className={`admin-nav-item ${isActive('/shipping-method') ? 'active' : ''}`}>
                            <Truck /> Shipping Methods
                        </Link>
                        <Link to="/admin/manage-business/event" className={`admin-nav-item ${isActive('/event') ? 'active' : ''}`}>
                            <Calendar /> Events & Sales
                        </Link>
                    </div>

                    <div className="admin-nav-group">
                        <div className="admin-nav-title">Catalog</div>
                        <Link to="/admin/manage-information/book" className={`admin-nav-item ${isActive('/book') ? 'active' : ''}`}>
                            <Book /> Books
                        </Link>
                        <Link to="/admin/manage-information/category" className={`admin-nav-item ${isActive('/category') ? 'active' : ''}`}>
                            <Layers /> Categories
                        </Link>
                        <Link to="/admin/manage-information/author" className={`admin-nav-item ${isActive('/author') ? 'active' : ''}`}>
                            <Users /> Authors
                        </Link>
                        <Link to="/admin/manage-information/serie" className={`admin-nav-item ${isActive('/serie') ? 'active' : ''}`}>
                            <Hash /> Series
                        </Link>
                    </div>

                    <div className="admin-nav-group">
                        <div className="admin-nav-title">Users</div>
                        <Link to="/admin/manage-user" className={`admin-nav-item ${isActive('/manage-user') ? 'active' : ''}`}>
                            <Users /> User Management
                        </Link>
                        <Link to="/admin/manage-role" className={`admin-nav-item ${isActive('/manage-role') ? 'active' : ''}`}>
                            <Shield /> Role Management
                        </Link>
                    </div>

                    <div className="admin-nav-group">
                        <div className="admin-nav-title">Communication</div>
                        <Link to="/admin/chat" className={`admin-nav-item ${isActive('/chat') ? 'active' : ''}`}>
                            <MessageCircle /> Chat
                        </Link>
                    </div>

                    <div className="admin-nav-group">
                        <div className="admin-nav-title">Gallery</div>
                        <Link to="/admin/gallery" className={`admin-nav-item ${isActive('/gallery') ? 'active' : ''}`}>
                            <ImageIcon /> Gallery
                        </Link>
                    </div>
                </nav>

                <div className="admin-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
