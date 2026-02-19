import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import '../../styles/pages/wishlist.css';
import wishlistService from '../../api/wishlistService';
import { getCurrentUserId } from '../../utils/auth';
import { toast } from 'react-toastify';
import BookCard from '../../components/BookCard';
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

    // Function to transform wishlist item to Book type for BookCard
    const transformToBook = (item: any): Book => {
        return {
            id: item.bookId,
            name: item.bookName,
            bookImageUrl: item.bookImageUrl,
            finalPrice: item.finalPrice || 0,
            originalCost: item.originalCost || item.finalPrice || 0,
            sale: item.sale || 0,
            authorName: item.authorName || 'Đang cập nhật',
            publisherName: item.publisherName || 'Đang cập nhật',
            rating: item.rating,
            ratingCount: item.ratingCount,
            seriesName: item.seriesName,
            volume: item.volume,
            status: 'ENABLE',
            stock: 1,
            pin: false,
            authorId: 0,
            publisherId: 0,
            categoryIds: []
        };
    };

    if (isLoading) {
        return (
            <div className="wishlist-page">
                <div className="wishlist-container">
                    <div className="wishlist-loading">
                        <div className="wishlist-loader"></div>
                        <p>Đang chuẩn bị danh sách của bạn...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="wishlist-container">
                <Breadcrumb
                    items={[
                        { label: 'Trang chủ', link: '/shop/home' },
                        { label: 'Yêu thích' }
                    ]}
                />
                <h2 className="wishlist-header-title">Sản phẩm yêu thích</h2>

                {wishlist.length === 0 ? (
                    <div className="wishlist-empty">
                        <div className="wishlist-empty__icon">
                            <Heart size={80} strokeWidth={1} />
                        </div>
                        <p className="wishlist-empty__text">Hiện tại bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
                        <Link to="/shop/books" className="wishlist-empty__btn">TIẾP TỤC MUA SẮM</Link>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlist.map(item => (
                            <BookCard
                                key={item.id}
                                book={transformToBook(item)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishList;

