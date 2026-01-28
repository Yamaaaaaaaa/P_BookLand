import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';
import '../styles/shop.css';
import { mainNavLinks } from '../data/mockNavigation';

interface HeaderProps {
    onLogout: () => void;
    cartItemCount?: number;
}

const Header = ({ onLogout, cartItemCount = 3 }: HeaderProps) => {
    return (
        <header className="shop-header">
            <div className="shop-container">
                <div className="shop-header__inner">
                    <Link to="/shop/home" className="shop-header__logo">
                        BOOKSAW
                    </Link>

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
                        <button className="shop-header__icon-btn" aria-label="Account">
                            <User size={20} />
                        </button>
                        <button onClick={onLogout} className="shop-header__logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
