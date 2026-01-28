import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import '../styles/shop.css';
import { mainNavLinks } from '../data/mockNavigation';

interface HeaderProps {
    onLogout: () => void;
    cartItemCount?: number;
}

const Header = ({ onLogout, cartItemCount = 3 }: HeaderProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="shop-header">
            <div className="shop-container">
                <div className="shop-header__inner">
                    <Link to="/shop/home" className="shop-header__logo">
                        BOOKSAW
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="shop-header__nav">
                        {mainNavLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className="shop-header__nav-link"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="shop-header__actions">
                        <button className="shop-header__icon-btn" aria-label="Search">
                            <Search size={20} />
                        </button>
                        <button className="shop-header__icon-btn" aria-label="Wishlist">
                            <Heart size={20} />
                        </button>
                        <Link to="/shop/cart" className="shop-header__icon-btn shop-header__cart-btn">
                            <ShoppingBag size={20} />
                            {cartItemCount > 0 && (
                                <span className="shop-header__cart-badge">{cartItemCount}</span>
                            )}
                        </Link>
                        <Link to="/shop/profile" className="shop-header__icon-btn" aria-label="Account">
                            <User size={20} />
                        </Link>
                        <button onClick={onLogout} className="shop-header__logout-btn">
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="shop-header__mobile-menu-btn"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="shop-header__mobile-overlay" onClick={closeMobileMenu} />
            )}

            {/* Mobile Menu */}
            <div className={`shop-header__mobile-menu ${isMobileMenuOpen ? 'shop-header__mobile-menu--open' : ''}`}>
                <nav className="shop-header__mobile-nav">
                    {mainNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className="shop-header__mobile-nav-link"
                            onClick={closeMobileMenu}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="shop-header__mobile-divider" />

                <div className="shop-header__mobile-actions">
                    <Link to="/shop/cart" className="shop-header__mobile-action" onClick={closeMobileMenu}>
                        <ShoppingBag size={20} />
                        <span>Cart</span>
                        {cartItemCount > 0 && (
                            <span className="shop-header__mobile-badge">{cartItemCount}</span>
                        )}
                    </Link>
                    <Link to="/shop/profile" className="shop-header__mobile-action" onClick={closeMobileMenu}>
                        <User size={20} />
                        <span>Profile</span>
                    </Link>
                    <button className="shop-header__mobile-action" onClick={() => { closeMobileMenu(); onLogout(); }}>
                        <Search size={20} />
                        <span>Search</span>
                    </button>
                    <button className="shop-header__mobile-action">
                        <Heart size={20} />
                        <span>Wishlist</span>
                    </button>
                </div>

                <div className="shop-header__mobile-divider" />

                <button onClick={() => { closeMobileMenu(); onLogout(); }} className="shop-header__mobile-logout">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
