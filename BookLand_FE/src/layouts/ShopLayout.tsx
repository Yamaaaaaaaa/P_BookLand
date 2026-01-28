import { Outlet, useNavigate } from 'react-router-dom';
import { logoutCustomer } from '../utils/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/shop.css';

const ShopLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutCustomer();
        navigate('/shop/login');
    };

    return (
        <div className="shop-layout">
            <Header onLogout={handleLogout} cartItemCount={3} />
            <main className="shop-main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default ShopLayout;
