import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/weekly-bestseller.css';
import { featuredBooks } from '../data/mockBooks';

const WeeklyBestseller = () => {
    const [activeTab, setActiveTab] = useState('Văn học');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const categories = ['Văn học', 'Kinh tế', 'Tâm lý - Kỹ năng sống', 'Thiếu nhi', 'Sách học ngoại ngữ', 'Foreign books', 'Thể loại khác'];

    // Use first 5 books for the ranking list
    const rankingBooks = featuredBooks.slice(0, 5);
    const selectedBook = rankingBooks[selectedIndex];

    return (
        <section className="weekly-bestseller">
            <div className="bestseller-container">
                <div className="bestseller-header">
                    <h2 className="bestseller-title">Bảng xếp hạng bán chạy tuần</h2>
                </div>

                <div className="bestseller-content">
                    <div className="bestseller-tabs">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`bestseller-tab-btn ${activeTab === cat ? 'active' : ''}`}
                                onClick={() => setActiveTab(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="bestseller-main">
                        {/* Ranking List */}
                        <div className="ranking-list">
                            {rankingBooks.map((book, index) => (
                                <div
                                    key={book.id}
                                    className={`ranking-item ${selectedIndex === index ? 'selected' : ''}`}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <span className={`ranking-number rank-${index + 1}`}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <img src={book.bookImageUrl} alt={book.name} className="ranking-thumb" />
                                    <div className="ranking-info">
                                        <h4 className="ranking-book-title">{book.name}</h4>
                                        <p className="ranking-author">{book.authorName}</p>
                                        <p className="ranking-points">{Math.floor(Math.random() * 2000)} điểm</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Selected Book Detail */}
                        <div className="ranking-detail">
                            <div className="detail-visual">
                                <img src={selectedBook?.bookImageUrl} alt={selectedBook?.name} className="detail-image" />
                            </div>
                            <div className="detail-info">
                                <h3 className="detail-title">{selectedBook?.name} (Tái Bản)</h3>
                                <div className="detail-meta">
                                    <p>Tác giả: <span>{selectedBook?.authorName}</span></p>
                                    <p>Nhà xuất bản: <span>{selectedBook?.publisherName}</span></p>
                                </div>
                                <div className="detail-price-row">
                                    <span className="detail-current-price">{selectedBook?.finalPrice.toLocaleString('vi-VN')} đ</span>
                                    <span className="detail-discount">-{Math.round(selectedBook?.sale * 100)}%</span>
                                </div>
                                <div className="detail-original-price">{selectedBook?.originalCost.toLocaleString('vi-VN')} đ</div>

                                <div className="detail-description">
                                    <h4 className="desc-heading">{selectedBook?.name.toUpperCase()}</h4>
                                    <p className="desc-text">
                                        {selectedBook?.description || "Một câu chuyện cuốn hút ngay từ những trang đầu tiên... Cuốn sách mang đến những trải nghiệm tâm lý sâu sắc và những bài học quý giá về cuộc sống."}
                                    </p>
                                    <p className="desc-author-bio">
                                        VỀ TÁC GIẢ: {selectedBook?.authorName} là một tác giả nổi tiếng với những tác phẩm mang đậm phong cách văn học lãng mạn hiện đại...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bestseller-footer">
                        <Link to="/ranking" className="bestseller-view-more">Xem thêm</Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WeeklyBestseller;
