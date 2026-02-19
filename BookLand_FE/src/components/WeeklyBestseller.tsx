import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/weekly-bestseller.css';
import bookService from '../api/bookService';
import categoryService from '../api/categoryService';
import type { Book } from '../types/Book';
import type { Category } from '../types/Category';

const WeeklyBestseller = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ page: 0, size: 20 });
                if (response.result && response.result.content && response.result.content.length > 0) {
                    setCategories(response.result.content);
                    setActiveCategoryId(response.result.content[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Books when active category changes
    useEffect(() => {
        if (activeCategoryId === null) return;

        const fetchBestSellers = async () => {
            try {
                const response = await bookService.getBestSellingBooks({
                    period: 'MONTH',
                    categoryIds: [activeCategoryId],
                    page: 0,
                    size: 5
                });
                if (response.result && response.result.content) {
                    setBooks(response.result.content);
                    setSelectedIndex(0); // Reset selection
                }
            } catch (error) {
                console.error("Failed to fetch bestseller books", error);
            }
        };

        fetchBestSellers();
    }, [activeCategoryId]);

    const selectedBook = books[selectedIndex];

    return (
        <section className="weekly-bestseller">
            <div className="bestseller-container">
                <div className="bestseller-header">
                    <h2 className="bestseller-title">Bảng xếp hạng bán chạy Tháng</h2>
                </div>

                <div className="bestseller-content">
                    <div className="bestseller-tabs">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`bestseller-tab-btn ${activeCategoryId === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategoryId(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="bestseller-main">
                        {/* Ranking List */}
                        <div className="ranking-list">
                            {books.map((book, index) => (
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
                                        <p className="ranking-points">Đã bán: {Math.floor(Math.random() * 200) + 100}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Selected Book Detail */}
                        {selectedBook && (
                            <div className="ranking-detail">
                                <div className="detail-visual">
                                    <img src={selectedBook.bookImageUrl} alt={selectedBook.name} className="detail-image" />
                                </div>
                                <div className="detail-info">
                                    <h3 className="detail-title">{selectedBook.name}</h3>
                                    <div className="detail-meta">
                                        <p>Tác giả: <span>{selectedBook.authorName}</span></p>
                                        <p>Nhà xuất bản: <span>{selectedBook.publisherName}</span></p>
                                    </div>
                                    <div className="detail-price-row">
                                        <span className="detail-current-price">{selectedBook.finalPrice?.toLocaleString('vi-VN')} đ</span>
                                        {selectedBook.sale > 0 && (
                                            <span className="detail-discount">-{Math.round(selectedBook.sale)}%</span>
                                        )}
                                    </div>
                                    {selectedBook.sale > 0 && (
                                        <div className="detail-original-price">{selectedBook.originalCost.toLocaleString('vi-VN')} đ</div>
                                    )}

                                    <div className="detail-description">
                                        <h4 className="desc-heading">{selectedBook.name.toUpperCase()}</h4>
                                        <p className="desc-text">
                                            {selectedBook.description || "Mô tả đang cập nhật..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
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
