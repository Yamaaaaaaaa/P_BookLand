import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';
import '../styles/components/book-card.css';
import '../styles/components/buttons.css';
import type { Book } from '../types/Book';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

interface BookCardProps {
    book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
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
        <div className="book-card">


            <div className="book-card__image-wrapper">
                <img
                    src={book.bookImageUrl || 'https://via.placeholder.com/150'}
                    alt={book.name}
                    className="book-card__image"
                />
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
                <span className="book-card__category">{book.seriesName || 'General'}</span>
                <h3 className="book-card__title">{book.name}</h3>
                <p className="book-card__author">by {book.authorName}</p>

                <div className="book-card__footer">
                    <div className="book-card__price">
                        {formatCurrency(book.originalCost - (book.sale || 0))}
                        {book.sale > 0 && (
                            <span className="book-card__price-old">
                                {formatCurrency(book.originalCost)}
                            </span>
                        )}
                    </div>
                    <div className="book-card__rating">
                        <div className="book-card__stars">
                            {renderStars(5)}
                        </div>
                        <span className="book-card__rating-count">(0)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
