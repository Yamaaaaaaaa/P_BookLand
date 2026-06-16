import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/recommendations.css';
import bookService from '../api/bookService';
import type { Book } from '../types/Book';
import { useTranslation } from 'react-i18next';

const Recommendations = ({ itemLimit = 5 }: { itemLimit?: number }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await bookService.getAllBooks({
                    pinned: true,
                    page: 0,
                    size: itemLimit
                });
                if (response.result && response.result.content) {
                    setBooks(response.result.content);
                }
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
            }
        };

        fetchRecommendations();
    }, [itemLimit]);

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

    return (
        <section className="recommendations-section">
            <div className="recommendations-container">
                <div className="recommendations-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="recommendations-icon-box">
                            <span style={{ fontSize: '20px' }}>💡</span>
                        </div>
                        <h2 className="recommendations-title">{t('home.recommendations.title')}</h2>
                    </div>
                </div>
                <div className="recommendations-grid-wrapper" style={{ position: 'relative' }}>
                    {books.length > 5 && (
                        <button className="nav-prev" onClick={scrollLeft}>&lt;</button>
                    )}
                    <div className="recommendations-grid" ref={scrollRef}>
                    {books.map((book) => (
                        <Link key={book.id} to={`/shop/book-detail/${book.id}`} className="recommend-card">
                            <div className="recommend-image-wrapper">
                                <img src={book.bookImageUrl} alt={book.name} className="recommend-image" />
                            </div>
                            <div className="recommend-info">
                                <h3 className="recommend-book-name">{book.name}</h3>
                                <div className="recommend-price-row">
                                    <span className="recommend-current-price">
                                        {book.finalPrice?.toLocaleString('vi-VN')} đ
                                    </span>
                                    {book.sale > 0 && (
                                        <span className="recommend-discount">-{Math.round(book.sale)}%</span>
                                    )}
                                </div>
                                {book.sale > 0 && (
                                    <div className="recommend-original-price">
                                        {book.originalCost.toLocaleString('vi-VN')} đ
                                    </div>
                                )}
                                <div className="recommend-stats">
                                    <div className="recommend-rating">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span key={s} style={{ color: s <= Math.round(book.rating || 0) ? '#F69113' : '#ddd' }}>★</span>
                                        ))}
                                    </div>
                                    <span className="recommend-sold">| Đã bán {book.soldCount || 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                    </div>
                    {books.length > 5 && (
                        <button className="nav-next" onClick={scrollRight}>&gt;</button>
                    )}
                </div>

            </div>
        </section>
    );
};

export default Recommendations;
