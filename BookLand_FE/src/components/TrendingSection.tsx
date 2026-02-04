import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import '../styles/components/trending-section.css';
import { featuredBooks } from '../data/mockBooks';

const TrendingSection = () => {
    const [activeTab, setActiveTab] = useState('daily');

    const tabs = [
        { id: 'daily', label: 'Xu Hướng Theo Ngày' },
        { id: 'hot', label: 'Sách HOT - Giảm Sốc' },
        { id: 'bestseller', label: 'Bestseller Ngoại Văn' }
    ];

    // Subsets of books for different tabs (mocking variety)
    const displayBooks = featuredBooks.slice(0, 10);

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
                    {displayBooks.map((book, index) => {
                        const isSoldOutSoon = index === 1 || index === 4 || index === 9; // Mocking some "almost out" items
                        const soldCount = Math.floor(Math.random() * 500);

                        return (
                            <Link key={book.id} to={`/shop/book/${book.id}`} className="trending-card">
                                <div className="trending-image-wrapper">
                                    <img src={book.bookImageUrl} alt={book.name} className="trending-image" />
                                </div>
                                <div className="trending-info">
                                    <h3 className="trending-book-name">
                                        {index % 3 === 0 && <span className="inline-badge">Xu hướng</span>}
                                        {index % 7 === 0 && <span className="inline-badge inline-badge--new">Mới</span>}
                                        {book.name}
                                    </h3>
                                    <div className="trending-price-group">
                                        <span className="trending-current-price">
                                            {book.finalPrice.toLocaleString('vi-VN')} đ
                                        </span>
                                        <span className="trending-discount">-{Math.round(book.sale * 100)}%</span>
                                    </div>
                                    <div className="trending-original-price">
                                        {book.originalCost.toLocaleString('vi-VN')} đ
                                    </div>
                                    <div className={`trending-sold-bar ${isSoldOutSoon ? 'trending-sold-bar--warning' : ''}`}>
                                        <div
                                            className="trending-sold-progress"
                                            style={{ width: isSoldOutSoon ? '90%' : '35%' }}
                                        ></div>
                                        <span className="trending-sold-text">
                                            {isSoldOutSoon ? 'Sắp hết' : `Đã bán ${soldCount}`}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* View More Button */}
                <div className="trending-footer">
                    <button className="trending-view-more">Xem Thêm</button>
                </div>
            </div>
        </section>
    );
};

export default TrendingSection;
