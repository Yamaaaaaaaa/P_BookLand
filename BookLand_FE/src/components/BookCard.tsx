import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';
import '../styles/components/book-card.css';
import '../styles/components/buttons.css';
import type { Book } from '../types/Book';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

interface BookCardProps {
    book: Book;
    viewMode?: 'grid' | 'list';
}

const BookCard = ({ book, viewMode = 'grid' }: BookCardProps) => {
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} size={12} fill="currentColor" />);
        }
        if (hasHalfStar) {
            stars.push(<Star key="half" size={12} fill="currentColor" opacity={0.5} />);
        }
        for (let i = stars.length; i < 5; i++) {
            stars.push(<Star key={i} size={12} />);
        }

        return stars;
    };

    return (
        <div className={`book-card book-card--${viewMode}`}>
            <div className="book-card__image-wrapper">
                <img
                    src={book.bookImageUrl || 'https://via.placeholder.com/150'}
                    alt={book.name}
                    className="book-card__image"
                />

                {/* Series/Tag (Specific slot in image area) */}
                {book.seriesName && (
                    <div className="book-card__series-tag">
                        {book.seriesName}
                    </div>
                )}

                {/* Volume Badge at Bottom Right of Image */}
                {book.volume && (
                    <div className="book-card__volume-badge">
                        Tập {book.volume}
                    </div>
                )}

                <div className="book-card__actions">
                    <button className="book-card__action-btn" aria-label="Add to wishlist">
                        <Heart size={16} />
                    </button>
                    <Link className="book-card__action-btn" aria-label="Quick view" to={`/shop/book-detail/${book.id}`} >
                        <Eye size={16} />
                    </Link>
                    <button className="book-card__action-btn" aria-label="Add to cart">
                        <ShoppingCart size={16} />
                    </button>
                </div>
            </div>

            <div className="book-card__content">
                <h3 className="book-card__title">{book.name}</h3>

                {viewMode === 'list' && (
                    <div className="book-card__details-list">
                        <p className="book-card__author">Tác giả: <strong>{book.authorName}</strong></p>
                        <p className="book-card__description">{book.description || 'Đang cập nhật nội dung...'}</p>
                    </div>
                )}

                <div className="book-card__price-row">
                    <span className="book-card__price-final">{formatCurrency(book.finalPrice)}</span>
                    {book.sale > 0 && (
                        <span className="book-card__discount">-{book.sale}%</span>
                    )}
                </div>

                {book.sale > 0 && (
                    <div className="book-card__price-original">
                        {formatCurrency(book.originalCost)}
                    </div>
                )}

                <div className="book-card__rating">
                    <div className="book-card__stars">
                        {renderStars(book.rating || 5)}
                    </div>
                    {book.ratingCount !== undefined && (
                        <span className="book-card__rating-count">({book.ratingCount})</span>
                    )}
                </div>

                {viewMode === 'list' && (
                    <div className="book-card__actions-list">
                        <button className="btn-add-cart-list">
                            <ShoppingCart size={18} />
                            Thêm vào giỏ hàng
                        </button>
                        <button className="btn-buy-now-list">Mua ngay</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookCard;
