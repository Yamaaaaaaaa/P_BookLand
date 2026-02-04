import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, Truck, RotateCcw, ShieldCheck, ChevronRight, Minus, Plus } from 'lucide-react';
import { getBookById, featuredBooks } from '../../data/mockBooks';
import '../../styles/pages/book-detail.css';
import BookCard from '../../components/BookCard';

const BookDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const book = getBookById(id || '');
    const [quantity, setQuantity] = useState(1);

    if (!book) {
        return (
            <div className="book-not-found-page">
                <div className="shop-container">
                    <div className="not-found-content">
                        <h2>Không tìm thấy sản phẩm</h2>
                        <Link to="/shop" className="btn-back-home">
                            <ArrowLeft size={16} /> Quay lại cửa hàng
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc') setQuantity(q => q + 1);
        else if (quantity > 1) setQuantity(q => q - 1);
    };

    return (
        <div className="book-detail-page">
            <div className="shop-container">
                {/* Breadcrumb */}
                <nav className="detail-breadcrumb">
                    <Link to="/shop/home">Trang chủ</Link>
                    <ChevronRight size={14} />
                    <Link to="/shop/books">{book.seriesName}</Link>
                    <ChevronRight size={14} />
                    <span>{book.name}</span>
                </nav>

                <div className="detail-main-content">
                    {/* Left: Product Media & Policy */}
                    <div className="detail-left-col">
                        <div className="detail-left-sticky">
                            <div className="detail-image-card">
                                <div className="detail-main-image">
                                    <img src={book.bookImageUrl} alt={book.name} />
                                    {book.sale > 0 && (
                                        <div className="detail-sale-badge">-{Math.round(book.sale * 100)}%</div>
                                    )}
                                </div>
                                <div className="detail-thumbnails">
                                    <img src={book.bookImageUrl} className="thumb active" alt="thumb" />
                                    <div className="thumb more">+18</div>
                                </div>
                                <div className="detail-actions">
                                    <button className="btn-add-cart">
                                        <ShoppingCart size={20} />
                                        <span style={{ marginLeft: '10px' }}>Thêm vào giỏ hàng</span>
                                    </button>
                                    <button className="btn-buy-now">Mua ngay</button>
                                </div>
                            </div>

                            <div className="detail-policy-card">
                                <h3>Chính sách ưu đãi của BookLand</h3>
                                <div className="policy-item">
                                    <Truck size={20} color="#C92127" />
                                    <div className="policy-text">
                                        <div className="p-title">Thời gian giao hàng: <span>Giao nhanh và uy tín</span></div>
                                    </div>
                                    <ChevronRight size={16} color="#999" />
                                </div>
                                <div className="policy-item">
                                    <RotateCcw size={20} color="#C92127" />
                                    <div className="policy-text">
                                        <div className="p-title">Chính sách đổi trả: <span>Đổi trả miễn phí toàn quốc</span></div>
                                    </div>
                                    <ChevronRight size={16} color="#999" />
                                </div>
                                <div className="policy-item">
                                    <ShieldCheck size={20} color="#C92127" />
                                    <div className="policy-text">
                                        <div className="p-title">Chính sách khách sỉ: <span>Ưu đãi khi mua số lượng lớn</span></div>
                                    </div>
                                    <ChevronRight size={16} color="#999" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="detail-right-col">
                        <div className="detail-info-card">
                            <h1 className="detail-book-title">{book.name}</h1>
                            <div className="detail-quick-meta">
                                <div className="meta-row">
                                    <span>Nhà cung cấp: <Link to="/">{book.publisherName}</Link></span>
                                    <span>Tác giả: <strong>{book.authorName}</strong></span>
                                </div>
                                <div className="meta-row">
                                    <span>Nhà xuất bản: <strong>{book.publisherName}</strong></span>
                                    <span>Hình thức bìa: <strong>Bìa Mềm</strong></span>
                                </div>
                            </div>

                            <div className="detail-rating-row">
                                <div className="stars-box">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#F69113" color="#F69113" />)}
                                    <span className="rating-count">(0 đánh giá)</span>
                                </div>
                                <div className="sold-count">| Đã bán 76</div>
                            </div>

                            <div className="detail-price-box">
                                <div className="price-primary">
                                    <span className="current">{book.finalPrice.toLocaleString('vi-VN')} đ</span>
                                    <span className="original">{book.originalCost.toLocaleString('vi-VN')} đ</span>
                                    <span className="discount">-{Math.round(book.sale * 100)}%</span>
                                </div>
                                <div className="price-note">Chính sách khuyến mãi trên chỉ áp dụng tại BookLand.com</div>
                            </div>

                            <div className="quantity-section">
                                <label>Số lượng:</label>
                                <div className="quantity-control">
                                    <button onClick={() => handleQuantityChange('dec')}><Minus size={14} /></button>
                                    <input type="text" value={quantity} readOnly />
                                    <button onClick={() => handleQuantityChange('inc')}><Plus size={14} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="detail-specs-card">
                            <h3>Thông tin chi tiết</h3>
                            <div className="specs-table">
                                <div className="spec-row">
                                    <div className="spec-label">Mã hàng</div>
                                    <div className="spec-value">8935278609865</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">Tên Nhà Cung Cấp</div>
                                    <div className="spec-value">{book.publisherName}</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">Tác giả</div>
                                    <div className="spec-value">{book.authorName}</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">NXB</div>
                                    <div className="spec-value">{book.publisherName}</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">Năm XB</div>
                                    <div className="spec-value">2024</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">Ngôn ngữ</div>
                                    <div className="spec-value">Tiếng Việt</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">Trọng lượng (gr)</div>
                                    <div className="spec-value">550</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">Kích Thước Bao Bì</div>
                                    <div className="spec-value">23.5 x 15.5 x 2.5 cm</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">Số trang</div>
                                    <div className="spec-value">480</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">Hình thức</div>
                                    <div className="spec-value">Bìa Mềm</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="detail-desc-card">
                            <h3>Mô tả sản phẩm</h3>
                            <div className="desc-content">
                                <strong>{book.name}</strong>
                                <p>{book.description || "Cuốn sách mở cánh cửa toàn cầu cho người Việt trong kỷ nguyên AI và hội nhập..."}</p>
                                <div className="desc-author-note">
                                    VỀ TÁC GIẢ: <strong>{book.authorName}</strong> là nhà văn, blogger nổi tiếng...
                                </div>
                            </div>
                            <div className="desc-footer">
                                <button className="btn-show-more">Xem thêm</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Full-Width Sections */}
                <div className="detail-bottom-content">
                    {/* Reviews (Skeleton) */}
                    <div className="detail-reviews-card">
                        <h3>Đánh giá sản phẩm</h3>
                        <div className="reviews-summary">
                            <div className="rev-score">0<span>/5</span></div>
                            <div className="rev-stars">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} color="#ddd" />)}
                                <div className="rev-count">(0 đánh giá)</div>
                            </div>
                            <div className="rev-chart">
                                {/* Simplified chart bars */}
                                {[5, 4, 3, 2, 1].map(r => (
                                    <div key={r} className="chart-item">
                                        <span>{r} sao</span>
                                        <div className="bar-bg"><div className="bar-fill" style={{ width: '0%' }}></div></div>
                                        <span>0%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Related Products Slider Style */}
                    <div className="detail-related-card">
                        <h3>BOOKLAND GIỚI THIỆU</h3>
                        <div className="related-grid">
                            {featuredBooks.slice(0, 5).map(item => (
                                <BookCard key={item.id} book={item} />
                            ))}
                        </div>
                        <div className="related-footer">
                            <button className="btn-show-more">Xem thêm</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;
