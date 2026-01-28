import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ArrowLeft, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { getBookById, getRelatedBooks } from '../../data/mockBooks';
import '../../styles/shop.css';
import BookCard from '../../components/BookCard';
import { formatCurrency } from '../../utils/formatters';

const BookDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const book = getBookById(id || '');

    if (!book) {
        return (
            <div className="book-detail-page">
                <div className="shop-container">
                    <div className="book-detail__not-found">
                        <h2>Book not found</h2>
                        <Link to="/shop" className="btn-primary">
                            <ArrowLeft size={16} />
                            Back to Shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const relatedBooks = getRelatedBooks(book);

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} size={18} fill="currentColor" />);
        }
        if (hasHalfStar) {
            stars.push(<Star key="half" size={18} fill="currentColor" opacity={0.5} />);
        }
        for (let i = stars.length; i < 5; i++) {
            stars.push(<Star key={i} size={18} />);
        }

        return stars;
    };

    return (
        <div className="book-detail-page">
            <div className="shop-container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/shop/home" className="breadcrumb__link">Home</Link>
                    <span className="breadcrumb__separator">/</span>
                    <Link to="/shop/books" className="breadcrumb__link">Books</Link>
                    <span className="breadcrumb__separator">/</span>
                    <span className="breadcrumb__current">{book.name}</span>
                </nav>

                {/* Book Detail */}
                <div className="book-detail">
                    {/* Image Section */}
                    <div className="book-detail__image-section">
                        <div className="book-detail__image-wrapper">

                            <img src={book.bookImageUrl} alt={book.name} className="book-detail__image" />
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="book-detail__info">
                        <span className="book-detail__category">{book.categories?.[0]?.name}</span>
                        <h1 className="book-detail__title">{book.name}</h1>
                        <p className="book-detail__author">by <strong>{book.author?.name}</strong></p>

                        {/* Rating */}
                        <div className="book-detail__rating">
                            <div className="book-detail__stars">
                                {renderStars(5)}
                            </div>
                            <span className="book-detail__rating-text">
                                5.0 (0 reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="book-detail__price-section">
                            <span className="book-detail__price">{formatCurrency(book.originalCost)}</span>
                            {/* Original price logic is confusing with 'originalCost' vs 'sale', assuming originalCost is final unless sale > 0 */}
                        </div>

                        {/* Description */}
                        <div className="book-detail__description">
                            <h3>Description</h3>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                                irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            </p>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="book-detail__actions">
                            <div className="quantity-selector">
                                <button className="quantity-selector__btn">-</button>
                                <span className="quantity-selector__value">1</span>
                                <button className="quantity-selector__btn">+</button>
                            </div>
                            <button className="btn-primary btn-primary--large">
                                <ShoppingCart size={18} />
                                Add to Cart
                            </button>
                            <button className="btn-icon">
                                <Heart size={20} />
                            </button>
                            <button className="btn-icon">
                                <Share2 size={20} />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="book-detail__features">
                            <div className="book-detail__feature">
                                <Truck size={20} />
                                <span>Free Shipping</span>
                            </div>
                            <div className="book-detail__feature">
                                <Shield size={20} />
                                <span>Secure Payment</span>
                            </div>
                            <div className="book-detail__feature">
                                <RotateCcw size={20} />
                                <span>30-Day Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Books */}
                {relatedBooks.length > 0 && (
                    <section className="related-books">
                        <div className="section-header">
                            <span className="section-header__subtitle">You May Also Like</span>
                            <h2 className="section-header__title">Related Books</h2>
                        </div>
                        <div className="related-books__grid">
                            {relatedBooks.map((relatedBook) => (
                                <div key={relatedBook.id} className="book-grid__link">
                                    <BookCard book={relatedBook} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default BookDetailPage;
