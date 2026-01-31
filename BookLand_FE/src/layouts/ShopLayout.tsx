import { Outlet, useNavigate } from 'react-router-dom';
import { logoutCustomer, isCustomerAuthenticated, getCustomerRefreshToken } from '../utils/auth';
import authService from '../api/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/variables.css';
import '../styles/base.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';

const ShopLayout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const refreshToken = getCustomerRefreshToken();
        if (refreshToken) {
            try {
                await authService.logout({ token: refreshToken });
            } catch (error) {
                console.error("Logout failed", error);
            }
        }
        logoutCustomer();
        navigate('/shop/login');
    };

    return (
        <div className="shop-layout">
            <Header onLogout={handleLogout} cartItemCount={3} isAuthenticated={isCustomerAuthenticated()} />
            <main className="shop-main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default ShopLayout;
