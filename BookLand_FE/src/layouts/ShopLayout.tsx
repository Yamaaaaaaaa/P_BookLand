import { Outlet, useNavigate } from 'react-router-dom';
import { logoutCustomer, isCustomerAuthenticated, getCustomerRefreshToken } from '../utils/auth';
import authService from '../api/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import cartService from '../api/cartService';
import userService from '../api/userService';
import { getCurrentUserId, setCustomerUserId, getCustomerEmailFromToken } from '../utils/auth';
import { useState, useEffect } from 'react';
import '../styles/variables.css';
import '../styles/base.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';

const ShopLayout = () => {
    const navigate = useNavigate();

    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        const userId = getCurrentUserId();
        if (userId) {
            try {
                const response = await cartService.getUserCart(userId);
                if (response.result && response.result.items) {
                    setCartCount(response.result.items.length);
                }
            } catch (error) {
                console.error("Failed to fetch cart count", error);
            }
        } else {
            setCartCount(0);
        }
    };

    useEffect(() => {
        const initializeUser = async () => {
            if (isCustomerAuthenticated()) {
                let userId = getCurrentUserId();

                // If ID is missing, fetch it from API
                if (!userId) {
                    try {
                        const email = getCustomerEmailFromToken();
                        if (email) {
                            const response = await userService.getAllUsers({ keyword: email });
                            if (response.result && response.result.content.length > 0) {
                                // Find exact match by email
                                const user = response.result.content.find((u: any) => u.email === email);
                                if (user) {
                                    userId = user.id;
                                    setCustomerUserId(userId);
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Failed to fetch user info by email", error);
                    }
                }

                if (userId) {
                    fetchCartCount();
                }
            } else {
                setCartCount(0);
            }
        };

        initializeUser();

        // Listen for cart:updated custom event
        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('cart:updated', handleCartUpdate);
        return () => window.removeEventListener('cart:updated', handleCartUpdate);
    }, [isCustomerAuthenticated()]);

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
            <Header onLogout={handleLogout} cartItemCount={cartCount} isAuthenticated={isCustomerAuthenticated()} />
            <main className="shop-main">
                <Outlet />
            </main>
            <Footer />
            {isCustomerAuthenticated() && <ChatWidget />}
        </div>
    );
};

export default ShopLayout;
