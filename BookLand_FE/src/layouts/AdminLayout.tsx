import { Outlet, Link, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../utils/auth';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };

    return (
        <div>
            <aside>
                <h2>Admin Panel</h2>
                <nav>
                    <div>
                        <Link to="/admin/dashboard">Dashboard</Link>
                    </div>
                    <div>
                        <strong>Manage Business</strong>
                        <Link to="/admin/manage-business/all-bills">All Bills</Link>
                        <Link to="/admin/manage-business/payment-method">Payment Method</Link>
                        <Link to="/admin/manage-business/shipping-method">Shipping Method</Link>
                    </div>
                    <div>
                        <Link to="/admin/manage-user">Manage User</Link>
                    </div>
                    <div>
                        <strong>Manage Information</strong>
                        <Link to="/admin/manage-information/book">Books</Link>
                        <Link to="/admin/manage-information/category">Categories</Link>
                        <Link to="/admin/manage-information/author">Authors</Link>
                        <Link to="/admin/manage-information/serie">Series</Link>
                    </div>
                    <button onClick={handleLogout}>Logout</button>
                </nav>
            </aside>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
