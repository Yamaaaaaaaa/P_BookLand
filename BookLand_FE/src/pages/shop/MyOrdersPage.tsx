
import { useState, useEffect } from 'react';
import {
    User,
    ClipboardList,
    ChevronDown,
    Eye,
    X,
    Star,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/profile.css'; // Re-use profile styles
import userService from '../../api/userService';
import billService from '../../api/billService';
import bookCommentApi from '../../api/bookCommentApi';
import paymentApi from '../../api/paymentApi';
import { getCurrentUserId } from '../../utils/auth';
import { formatCurrency } from '../../utils/formatters';
import type { User as UserType } from '../../types/User';
import type { Bill } from '../../types/Bill';
import type { BookComment } from '../../types/BookComment';
import { toast } from 'react-toastify';

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const userId = getCurrentUserId();
    const [userData, setUserData] = useState<UserType | null>(null);
    const [orders, setOrders] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Bill | null>(null);
    const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
    const [billReviews, setBillReviews] = useState<Record<number, BookComment>>({});

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewTarget, setReviewTarget] = useState<{ bookId: number, bookName: string, billId: number } | null>(null);
    const [reviewIdToEdit, setReviewIdToEdit] = useState<number | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (!userId) {
            navigate('/shop/login');
            return;
        }
        fetchUserData();
        fetchOrders();
    }, [userId]);

    const fetchUserData = async () => {
        try {
            const response = await userService.getOwnProfile();
            if (response.result) {
                setUserData(response.result);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await billService.getOwnBills({ size: 50 });
            if (response.result) {
                setOrders(response.result.content);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewOrderDetails = async (orderId: number) => {
        try {
            const [billResponse, reviewsResponse] = await Promise.all([
                billService.getBillById(orderId),
                bookCommentApi.getCommentsByBill(orderId)
            ]);

            if (billResponse.result) {
                setSelectedOrder(billResponse.result);
                setIsOrderDetailOpen(true);
            }

            if (reviewsResponse.result) {
                const reviewsMap: Record<number, BookComment> = {};
                reviewsResponse.result.forEach((r: BookComment) => {
                    reviewsMap[r.bookId] = r;
                });
                setBillReviews(reviewsMap);
            } else {
                setBillReviews({});
            }
        } catch (error) {
            console.error('Failed to fetch bill details:', error);
            toast.error('Không thể lấy chi tiết đơn hàng');
        }
    };

    const handlePayment = async (billId: number) => {
        try {
            const response = await paymentApi.createPayment(billId);
            if (response.result && response.result.url) {
                window.location.href = response.result.url;
            } else {
                toast.error('Không thể tạo đường dẫn thanh toán');
            }
        } catch (error) {
            console.error("Payment creation failed", error);
            toast.error('Có lỗi xảy ra khi tạo thanh toán');
        }
    };

    const openReviewModal = (bookId: number, bookName: string, billId: number, existingReview?: BookComment) => {
        setReviewTarget({ bookId, bookName, billId });
        if (existingReview) {
            setReviewRating(existingReview.rating);
            setReviewContent(existingReview.comment);
            setReviewIdToEdit(existingReview.id);
        } else {
            setReviewRating(5);
            setReviewContent('');
            setReviewIdToEdit(null);
        }
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewTarget || !userId) return;

        if (!reviewContent.trim()) {
            toast.warning('Vui lòng nhập nội dung đánh giá');
            return;
        }

        setIsSubmittingReview(true);
        try {
            if (reviewIdToEdit) {
                await bookCommentApi.updateComment(reviewIdToEdit, {
                    userId: userId,
                    bookId: reviewTarget.bookId,
                    billId: reviewTarget.billId,
                    rating: reviewRating,
                    content: reviewContent.trim()
                });
                toast.success('Cập nhật đánh giá thành công!');
            } else {
                await bookCommentApi.createComment({
                    userId: userId,
                    bookId: reviewTarget.bookId,
                    billId: reviewTarget.billId,
                    rating: reviewRating,
                    content: reviewContent.trim()
                });
                toast.success('Gửi đánh giá thành công!');
            }

            // Refresh reviews list for this bill
            const reviewsResponse = await bookCommentApi.getCommentsByBill(reviewTarget.billId);
            if (reviewsResponse.result) {
                const reviewsMap: Record<number, BookComment> = {};
                reviewsResponse.result.forEach((r: BookComment) => {
                    reviewsMap[r.bookId] = r;
                });
                setBillReviews(reviewsMap);
            }

            setIsReviewModalOpen(false);
        } catch (error: any) {
            console.error('Submit review error:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Không thể gửi đánh giá.');
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) {
        return (
            <div className="profile-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f0f0' }}>
                <Loader2 className="animate-spin" size={48} color="#C92127" />
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="shop-container">
                <div className="profile-layout">
                    {/* Sidebar */}
                    <aside className="profile-sidebar">
                        <div className="user-summary-card">
                            <div className="avatar-section-centered">
                                <div className="large-avatar-wrapper">
                                    <div className="avatar-circle">
                                        <User size={48} color="#ccd0d5" />
                                    </div>
                                </div>
                                <div className="user-info-centered">
                                    <h3>{userData?.firstName} {userData?.lastName}</h3>
                                </div>
                            </div>
                        </div>

                        <nav className="profile-nav">
                            <div className="nav-section">
                                <div className="nav-item" onClick={() => navigate('/shop/profile')}>
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <User size={20} />
                                            <span>Thông tin tài khoản</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="nav-item active">
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <ClipboardList size={20} />
                                            <span>Đơn hàng của tôi</span>
                                        </div>
                                        <ChevronDown size={14} className="arrow" />
                                    </div>
                                </div>
                                <div className="nav-item" onClick={() => navigate('/shop/my-reviews')}>
                                    <div className="nav-item-header">
                                        <div className="nav-item-wrapper">
                                            <MessageSquare size={20} />
                                            <span>Đánh giá của tôi</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="profile-main">
                        <div className="profile-form-section">
                            <h2 className="section-title">Đơn hàng của tôi</h2>
                            <div className="orders-list">
                                {orders.length === 0 ? (
                                    <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                                        <ClipboardList size={48} color="#ddd" style={{ marginBottom: '10px' }} />
                                        <p color="#666">Bạn chưa có đơn hàng nào.</p>
                                    </div>
                                ) : (
                                    <div className="orders-table-wrapper" style={{ overflowX: 'auto' }}>
                                        <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>
                                                    <th style={{ padding: '12px' }}>Mã đơn</th>
                                                    <th style={{ padding: '12px' }}>Ngày mua</th>
                                                    <th style={{ padding: '12px' }}>Tổng tiền</th>
                                                    <th style={{ padding: '12px' }}>TT Thanh toán</th>
                                                    <th style={{ padding: '12px' }}>Trạng thái</th>
                                                    <th style={{ padding: '12px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                        <td style={{ padding: '12px', fontWeight: 600 }}>#{order.id}</td>
                                                        <td style={{ padding: '12px' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '---'}</td>
                                                        <td style={{ padding: '12px', color: '#C92127', fontWeight: 700 }}>{formatCurrency(order.totalCost)}</td>
                                                        <td style={{ padding: '12px' }}>
                                                            {order.paymentMethodName === 'VNPAY' ? (
                                                                order.status === 'APPROVED' || order.status === 'COMPLETED' || order.status === 'SHIPPING' || order.status === 'SHIPPED' ? (
                                                                    <span style={{ color: '#1e7e34', fontWeight: 500 }}>Đã thanh toán</span>
                                                                ) : (
                                                                    <span style={{ color: '#f57c00', fontWeight: 500 }}>Chưa thanh toán</span>
                                                                )
                                                            ) : (
                                                                <span style={{ color: '#666' }}>COD</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px' }}>
                                                            <span className={`status-badge ${order.status.toLowerCase()}`} style={{
                                                                fontSize: '11px',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                backgroundColor: order.status === 'COMPLETED' ? '#e6f4ea' : '#fff8e1',
                                                                color: order.status === 'COMPLETED' ? '#1e7e34' : '#f57c00'
                                                            }}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            {order.paymentMethodName === 'VNPAY' && order.status === 'PENDING' && (
                                                                <button
                                                                    onClick={() => handlePayment(order.id)}
                                                                    style={{
                                                                        backgroundColor: '#005ba6',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}
                                                                    title="Thanh toán ngay"
                                                                >
                                                                    Thanh toán
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleViewOrderDetails(order.id)}
                                                                style={{ background: 'none', border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Order Detail Modal */}
            {isOrderDetailOpen && selectedOrder && (
                <div className="modal-backdrop" onClick={() => setIsOrderDetailOpen(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
                            <button className="btn-close-modal" onClick={() => setIsOrderDetailOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail-info">
                                <div className="info-column">
                                    <h4>Thông tin khách hàng</h4>
                                    <div className="info-item">
                                        <span className="info-label">Người nhận:</span>
                                        <span className="info-value">{selectedOrder.fullName || selectedOrder.userName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Số điện thoại:</span>
                                        <span className="info-value">{selectedOrder.phone || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="info-column">
                                    <h4>Thanh toán & Vận chuyển</h4>
                                    <div className="info-item">
                                        <span className="info-label">Trạng thái:</span>
                                        <span className="info-value highlight-blue">{selectedOrder.status}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Tổng tiền:</span>
                                        <span className="info-value text-red">{formatCurrency(selectedOrder.totalCost)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-books-section" style={{ marginTop: '20px' }}>
                                <h4>Sản phẩm đã mua</h4>
                                <table className="detail-books-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Đơn giá</th>
                                            <th>Số lượng</th>
                                            <th style={{ textAlign: 'right' }}>Thành tiền</th>
                                            {selectedOrder.status === 'COMPLETED' && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.books?.map((book, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="detail-book-item">
                                                        <img src={book.bookImageUrl} alt={book.bookName} className="detail-book-img" />
                                                        <span className="detail-book-name">{book.bookName}</span>
                                                    </div>
                                                </td>
                                                <td>{formatCurrency(book.priceSnapshot)}</td>
                                                <td>{book.quantity}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                    {formatCurrency(book.subtotal || (book.priceSnapshot * book.quantity))}
                                                </td>
                                                {selectedOrder.status === 'COMPLETED' && (
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button
                                                            className="btn-review-action"
                                                            onClick={() => openReviewModal(book.bookId, book.bookName, selectedOrder.id, billReviews[book.bookId])}
                                                            style={{
                                                                backgroundColor: billReviews[book.bookId] ? '#1976d2' : '#F69113',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            {billReviews[book.bookId] ? 'Sửa đánh giá' : 'Đánh giá'}
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {isReviewModalOpen && reviewTarget && (
                <div className="modal-backdrop" onClick={() => setIsReviewModalOpen(false)}>
                    <div className="modal-container review-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Đánh giá sản phẩm</h3>
                            <button className="btn-close-modal" onClick={() => setIsReviewModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="review-product-info" style={{ marginBottom: '16px', fontWeight: '600' }}>
                                {reviewTarget.bookName}
                            </div>

                            <div className="review-rating-input" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                        key={star}
                                        size={32}
                                        fill={star <= reviewRating ? "#F69113" : "none"}
                                        color={star <= reviewRating ? "#F69113" : "#ddd"}
                                        style={{ cursor: 'pointer', margin: '0 4px' }}
                                        onClick={() => setReviewRating(star)}
                                    />
                                ))}
                            </div>

                            <div className="review-content-input">
                                <label style={{ display: 'block', marginBottom: '8px' }}>Nhận xét của bạn:</label>
                                <textarea
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    rows={5}
                                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal-secondary" onClick={() => setIsReviewModalOpen(false)} style={{ marginRight: '10px', padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button>
                            <button
                                className="btn-modal-primary"
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview}
                                style={{ padding: '8px 16px', background: '#C92127', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: isSubmittingReview ? 0.7 : 1 }}
                            >
                                {isSubmittingReview ? 'Đang gửi...' : (reviewIdToEdit ? 'Cập nhật' : 'Gửi đánh giá')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
