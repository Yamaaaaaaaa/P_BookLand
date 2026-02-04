import { Link } from 'react-router-dom';
import { Stars } from 'lucide-react';
import '../styles/components/recommendations.css';
import { featuredBooks } from '../data/mockBooks';

const Recommendations = () => {
    // Show 10 books for the recommendation section
    const recommendedBooks = featuredBooks.slice(0, 15);

    return (
        <section className="recommendations-section">
            <div className="recommendations-container">
                <div className="recommendations-header">
                    <Stars className="spark-icon left" size={20} fill="white" color="white" />
                    <h2 className="recommendations-title">Gợi ý cho bạn</h2>
                    <Stars className="spark-icon right" size={20} fill="white" color="white" />
                </div>

                <div className="recommendations-grid">
                    {recommendedBooks.map((book) => (
                        <Link key={book.id} to={`/shop/book/${book.id}`} className="recommend-card">
                            <div className="recommend-image-wrapper">
                                <img src={book.bookImageUrl} alt={book.name} className="recommend-image" />
                            </div>
                            <div className="recommend-info">
                                <h3 className="recommend-book-name">{book.name}</h3>
                                <div className="recommend-price-row">
                                    <span className="recommend-current-price">
                                        {book.finalPrice.toLocaleString('vi-VN')} đ
                                    </span>
                                    <span className="recommend-discount">-{Math.round(book.sale * 100)}%</span>
                                </div>
                                <div className="recommend-original-price">
                                    {book.originalCost.toLocaleString('vi-VN')} đ
                                </div>
                                <div className="recommend-stats">
                                    <div className="recommend-rating">
                                        <span className="star-filled">★★★★★</span>
                                    </div>
                                    <span className="recommend-sold">| Đã bán {Math.floor(Math.random() * 100)}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="recommendations-footer">
                    <button className="recommend-view-all">Xem tất cả</button>
                </div>
            </div>
        </section>
    );
};

export default Recommendations;
