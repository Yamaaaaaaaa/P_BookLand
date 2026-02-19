import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import '../styles/components/trending-section.css';
import bookService from '../api/bookService';
import type { Book } from '../types/Book';

const TrendingSection = () => {
    const [activeTab, setActiveTab] = useState<string>('WEEK');
    const [books, setBooks] = useState<Book[]>([]);

    const tabs = [
        { id: 'WEEK', label: 'Xu Hướng Theo Tuần' },
        { id: 'MONTH', label: 'Xu Hướng Theo Tháng' },
        { id: 'YEAR', label: 'Xu Hướng Theo Năm' }
    ];

    useEffect(() => {
        const fetchTrendingBooks = async () => {
            try {
                const response = await bookService.getBestSellingBooks({
                    period: activeTab as any, // Cast to match type if needed
                    page: 0,
                    size: 5
                });
                if (response.result && response.result.content) {
                    setBooks(response.result.content);
                }
            } catch (error) {
                console.error("Failed to fetch trending books", error);
            }
        };

        fetchTrendingBooks();
    }, [activeTab]);

    return (
        <section className="trending-section">
            <div className="trending-container">
                {/* Section Header with Icon */}
                <div className="trending-header">
                    <div className="trending-title-bar">
                        <div className="trending-icon-box">
                            <TrendingUp size={20} color="white" strokeWidth={3} />
                        </div>
                        <h2 className="trending-title">Xu Hướng Mua Sắm</h2>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="trending-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`trending-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="trending-grid">
                    {books.map((book, index) => {
                        return (
                            <Link key={book.id} to={`/shop/book-detail/${book.id}`} className="trending-card">
                                <div className="trending-image-wrapper">
                                    <img src={book.bookImageUrl} alt={book.name} className="trending-image" />
                                </div>
                                <div className="trending-info">
                                    <h3 className="trending-book-name">
                                        {index === 0 && <span className="inline-badge">Top 1</span>}
                                        {book.name}
                                    </h3>
                                    <div className="trending-price-group">
                                        <span className="trending-current-price">
                                            {book.finalPrice?.toLocaleString('vi-VN')} đ
                                        </span>
                                        {book.sale > 0 && (
                                            <span className="trending-discount">-{Math.round(book.sale)}%</span>
                                        )}
                                    </div>
                                    {book.sale > 0 && (
                                        <div className="trending-original-price">
                                            {book.originalCost.toLocaleString('vi-VN')} đ
                                        </div>
                                    )}
                                    <div className="trending-sold-bar">
                                        <div
                                            className="trending-sold-progress"
                                            style={{ width: `${Math.min(book.stock, 100)}%` }}
                                        ></div>
                                        <span className="trending-sold-text">
                                            Còn lại {book.stock}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TrendingSection;
