import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import '../../styles/pages/profile.css';
import '../../styles/components/book-card.css';
import wishlistService from '../../api/wishlistService';
import cartService from '../../api/cartService';
import { getCurrentUserId } from '../../utils/auth';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/formatters';
import type { Book } from '../../types/Book';

const WishList = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWishlist = async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            toast.warning('Vui lòng đăng nhập để xem danh sách yêu thích');
            navigate('/shop/login');
            return;
        }

        setIsLoading(true);
        try {
            const response = await wishlistService.getUserWishlist(userId);
            if (response.result) {
                setWishlist(response.result);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
            toast.error('Không thể tải danh sách yêu thích');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (bookId: number) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        try {
            await wishlistService.removeFromWishlist(userId, bookId);
            setWishlist(items => items.filter(item => item.bookId !== bookId));
            toast.success('Đã xóa khỏi danh sách yêu thích');
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            toast.error('Không thể xóa sản phẩm');
        }
    };

    const addToCart = async (book: Book) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        try {
            await cartService.addToCart(userId, {
                bookId: book.id,
                quantity: 1
            });
            toast.success(`Đã thêm "${book.name}" vào giỏ hàng`);
            window.dispatchEvent(new Event('cart:updated'));
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Không thể thêm vào giỏ hàng');
        }
    };

    if (isLoading) {
        return (
            <div className="profile-main">
                <div className="loading-state">
                    <div className="loader"></div>
                    <p>Đang tải danh sách yêu thích...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-main">
            <h2 className="section-title">Danh sách yêu thích</h2>

            {wishlist.length === 0 ? (
                <div className="cart-empty-state">
                    <Heart size={80} color="#ddd" />
                    <p>Danh sách yêu thích của bạn đang trống.</p>
                    <Link to="/shop/books" className="btn-go-shopping">KHÁM PHÁ SÁCH</Link>
                </div>
            ) : (
                <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {wishlist.map(item => (
                        <div key={item.id} className="book-card grid" style={{ background: '#fff' }}>
                            <div className="book-card__image">
                                <Link to={`/shop/book-detail/${item.bookId}`}>
                                    <img src={item.bookImageUrl || 'https://via.placeholder.com/200x300'} alt={item.bookName} />
                                </Link>
                                <div className="book-card__actions">
                                    <button
                                        className="book-card__action-btn"
                                        onClick={() => removeFromWishlist(item.bookId)}
                                        title="Xóa khỏi yêu thích"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        className="book-card__action-btn"
                                        onClick={() => addToCart({ id: item.bookId, name: item.bookName } as Book)}
                                        title="Thêm vào giỏ hàng"
                                    >
                                        <ShoppingCart size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="book-card__info">
                                <h3 className="book-card__title">
                                    <Link to={`/shop/book-detail/${item.bookId}`}>{item.bookName}</Link>
                                </h3>
                                <div className="book-card__price">
                                    <span className="price-new">{formatCurrency(item.finalPrice || 0)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishList;
