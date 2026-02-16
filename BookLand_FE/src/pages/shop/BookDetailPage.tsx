import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, Truck, RotateCcw, ShieldCheck, ChevronRight, Minus, Plus, Heart } from 'lucide-react';
import '../../styles/pages/book-detail.css';
import BookCard from '../../components/BookCard';
import bookService from '../../api/bookService';
import cartService from '../../api/cartService';
import wishlistService from '../../api/wishlistService';
import { getCurrentUserId } from '../../utils/auth';
import type { Book } from '../../types/Book';
import type { BookComment, BookCommentSummaryResponse } from '../../types/BookComment';
import bookCommentApi from '../../api/bookCommentApi';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/formatters';

const BookDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
    const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

    // Comment State
    const [comments, setComments] = useState<BookComment[]>([]);
    const [commentSummary, setCommentSummary] = useState<BookCommentSummaryResponse | null>(null);
    const [commentPage, setCommentPage] = useState(1);
    const [commentTotalPages, setCommentTotalPages] = useState(1);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);

    useEffect(() => {
        const fetchBookDetail = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const response = await bookService.getBookById(Number(id));
                if (response.result) {
                    setBook(response.result);
                    // Fetch related books based on category
                    const relatedRes = await bookService.getAllBooks({
                        categoryIds: response.result.categoryIds,
                        size: 5
                    });
                    if (relatedRes.result) {
                        setRelatedBooks(relatedRes.result.content.filter(b => b.id !== Number(id)));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch book details:', error);
                toast.error('Không thể tải thông tin sản phẩm');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetail();
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const fetchComments = async () => {
            setIsCommentsLoading(true);
            try {
                const response = await bookCommentApi.getCommentsByBook(Number(id), {
                    page: commentPage,
                    size: 5,
                    sortBy: 'createdAt',
                    sortDirection: 'DESC'
                });
                if (response.result) {
                    setCommentSummary(response.result);
                    setComments(response.result.comments.content);
                    console.log("comments: ", response.result.comments.content);
                    console.log("commentSummary: ", response.result);
                    setCommentTotalPages(response.result.comments.totalPages);
                }
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            } finally {
                setIsCommentsLoading(false);
            }
        };
        fetchComments();
    }, [id, commentPage]);

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc') setQuantity(q => q + 1);
        else if (quantity > 1) setQuantity(q => q - 1);
    };

    const handleAddToCart = async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/shop/login');
            return;
        }

        if (!book) return;

        setIsAddingToCart(true);
        try {
            await cartService.addToCart(userId, {
                bookId: book.id,
                quantity: quantity
            });
            toast.success(`Đã thêm ${quantity} cuốn "${book.name}" vào giỏ hàng`);
            window.dispatchEvent(new Event('cart:updated'));
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleAddToWishlist = async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            toast.warning('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
            navigate('/shop/login');
            return;
        }

        if (!book) return;

        setIsAddingToWishlist(true);
        try {
            await wishlistService.addToWishlist(userId, {
                bookId: book.id
            });
            toast.success(`Đã thêm "${book.name}" vào danh sách yêu thích`);
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            toast.error('Không thể thêm vào danh sách yêu thích.');
        } finally {
            setIsAddingToWishlist(false);
        }
    };

    if (isLoading) {
        return (
            <div className="book-not-found-page">
                <div className="shop-container">
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Đang tải thông tin sản phẩm...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="book-not-found-page">
                <div className="shop-container">
                    <div className="not-found-content">
                        <h2>Không tìm thấy sản phẩm</h2>
                        <Link to="/shop/books" className="btn-back-home">
                            <ArrowLeft size={16} /> Quay lại cửa hàng
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="book-detail-page">
            <div className="shop-container">
                {/* Breadcrumb */}
                <nav className="detail-breadcrumb">
                    <Link to="/shop/home">Trang chủ</Link>
                    <ChevronRight size={14} />
                    <Link to="/shop/books">Sách</Link>
                    <ChevronRight size={14} />
                    <span>{book.name}</span>
                </nav>

                <div className="detail-main-content">
                    {/* Left: Product Media & Policy */}
                    <div className="detail-left-col">
                        <div className="detail-left-sticky">
                            <div className="detail-image-card">
                                <div className="detail-main-image">
                                    <img src={book.bookImageUrl || 'https://via.placeholder.com/400x600'} alt={book.name} />
                                    {book.sale > 0 && (
                                        <div className="detail-sale-badge">-{book.sale}%</div>
                                    )}
                                </div>
                                <div className="detail-thumbnails">
                                    <img src={book.bookImageUrl || 'https://via.placeholder.com/400x600'} className="thumb active" alt="thumb" />
                                </div>
                                <div className="detail-actions">
                                    <button
                                        className={`btn-add-cart ${isAddingToCart ? 'loading' : ''}`}
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart}
                                    >
                                        <ShoppingCart size={20} />
                                        <span style={{ marginLeft: '10px' }}>{isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</span>
                                    </button>
                                    <button
                                        className={`btn-add-wishlist ${isAddingToWishlist ? 'loading' : ''}`}
                                        onClick={handleAddToWishlist}
                                        disabled={isAddingToWishlist}
                                    >
                                        <Heart size={20} fill={isAddingToWishlist ? "currentColor" : "none"} />
                                    </button>
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
                                    <span>Nhà cung cấp: <strong>{book.publisherName}</strong></span>
                                    <span>Tác giả: <strong>{book.authorName}</strong></span>
                                </div>
                                <div className="meta-row">
                                    <span>Nhà xuất bản: <strong>{book.publisherName}</strong></span>
                                    <span>Hình thức bìa: <strong>Bìa Mềm</strong></span>
                                </div>
                            </div>

                            <div className="detail-rating-row">
                                <div className="stars-box">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            size={14}
                                            fill={s <= (commentSummary?.averageRating || book.rating || 5) ? "#F69113" : "none"}
                                            color="#F69113"
                                        />
                                    ))}
                                    <span className="rating-count">({comments.length || book.ratingCount || 0} đánh giá)</span>
                                </div>
                                <div className="sold-count">| Đã bán {book.ratingCount ? book.ratingCount * 12 : 24}</div>
                            </div>

                            <div className="detail-price-box">
                                <div className="price-primary">
                                    <span className="current">{formatCurrency(book.finalPrice)}</span>
                                    {book.sale > 0 && (
                                        <>
                                            <span className="original">{formatCurrency(book.originalCost)}</span>
                                            <span className="discount">-{book.sale}%</span>
                                        </>
                                    )}
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
                                    <div className="spec-value">{8935278600000 + book.id}</div>
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
                                    <div className="spec-label">Series</div>
                                    <div className="spec-value">{book.seriesName || 'N/A'}</div>
                                </div>
                                <div className="spec-row">
                                    <div className="spec-label">Volume</div>
                                    <div className="spec-value">{book.volume || '1'}</div>
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
                                <p>{book.description || "Đang cập nhật nội dung mô tả sản phẩm..."}</p>
                            </div>
                            <div className="desc-footer">
                                <button className="btn-show-more">Xem thêm</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Full-Width Sections */}
                <div className="detail-bottom-content">
                    {/* Related Products Section */}
                    {relatedBooks.length > 0 && (
                        <div className="detail-related-card">
                            <h3>SẢN PHẨM KHÁC TỪ BOOKLAND</h3>
                            <div className="related-grid">
                                {relatedBooks.map(item => (
                                    <BookCard key={item.id} book={item} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="detail-reviews-card">
                        <h3>Đánh giá sản phẩm</h3>

                        {commentSummary && (
                            <div className="reviews-summary">
                                <div className="rev-score">
                                    {commentSummary.averageRating.toFixed(1)}<span>/5</span>
                                </div>
                                <div className="rev-stars">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            size={18}
                                            fill={s <= Math.round(commentSummary.averageRating) ? "#F69113" : "none"}
                                            color={s <= Math.round(commentSummary.averageRating) ? "#F69113" : "#ddd"}
                                        />
                                    ))}
                                    <div className="rev-count">({commentSummary.totalComments} đánh giá)</div>
                                </div>
                                <div className="rev-chart">
                                    {[5, 4, 3, 2, 1].map(r => {
                                        const count = commentSummary.ratingCounts?.[r] || 0;
                                        const percent = commentSummary.totalComments > 0
                                            ? (count / commentSummary.totalComments) * 100
                                            : 0;
                                        return (
                                            <div key={r} className="chart-item">
                                                <span>{r} sao</span>
                                                <div className="bar-bg">
                                                    <div className="bar-fill" style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <span>{percent.toFixed(0)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="reviews-list">
                            {isCommentsLoading ? (
                                <p>Đang tải đánh giá...</p>
                            ) : comments.length > 0 ? (
                                comments.map(comment => (
                                    <div key={comment.id} className="review-item">
                                        <div className="review-header">
                                            <div className="reviewer-name">{comment.userName}</div>
                                            <div className="review-rating">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        fill={i < comment.rating ? "#F69113" : "none"}
                                                        color={i < comment.rating ? "#F69113" : "#ddd"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="review-content" style={{ marginTop: '8px', color: '#555' }}>
                                            {comment.comment}
                                        </div>
                                        <div className="review-date" style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
                                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>
                            )}
                        </div>

                        {/* Pagination */}
                        {commentTotalPages > 1 && (
                            <div className="pagination">
                                {Array.from({ length: commentTotalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`page-btn ${commentPage === page ? 'active' : ''}`}
                                        onClick={() => setCommentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;
