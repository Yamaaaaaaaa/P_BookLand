import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, Info, Gift, Ticket } from 'lucide-react';
import '../../styles/pages/cart.css';
import { mockCart } from '../../data/mockOrders';
import type { CartItem } from '../../types/CartItem';

const CartPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>(mockCart.items || []);
    const [selectedIds, setSelectedIds] = useState<number[]>(cartItems.map(item => item.book.id));

    const updateQuantity = (bookId: number, delta: number) => {
        setCartItems(items =>
            items.map(item =>
                item.book.id === bookId
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const removeItem = (bookId: number) => {
        setCartItems(items => items.filter(item => item.book.id !== bookId));
        setSelectedIds(ids => ids.filter(id => id !== bookId));
    };

    const toggleSelect = (bookId: number) => {
        setSelectedIds(prev =>
            prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === cartItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(cartItems.map(item => item.book.id));
        }
    };

    const selectedItems = cartItems.filter(item => selectedIds.includes(item.book.id));
    const subtotal = selectedItems.reduce((sum, item) => sum + item.book.finalPrice * item.quantity, 0);
    const total = subtotal; // Assuming VAT included or separate calculation for demo

    return (
        <div className="cart-page">
            <div className="shop-container">
                <div className="cart-header-title">
                    GIỎ HÀNG <span>({cartItems.length} sản phẩm)</span>
                </div>

                {cartItems.length === 0 ? (
                    <div className="cart-empty-state">
                        <ShoppingBag size={80} color="#ddd" />
                        <p>Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
                        <Link to="/shop/home" className="btn-go-shopping">MUA SẮM NGAY</Link>
                    </div>
                ) : (
                    <div className="cart-grid-layout">
                        {/* Left Column: Items */}
                        <div className="cart-main-col">
                            <div className="cart-select-all-bar">
                                <label className="cart-checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                    <span className="checkmark"></span>
                                    Chọn tất cả ({cartItems.length} sản phẩm)
                                </label>
                                <div className="bar-labels">
                                    <span>Số lượng</span>
                                    <span>Thành tiền</span>
                                </div>
                            </div>

                            <div className="cart-items-list">
                                {cartItems.map(item => (
                                    <div key={item.book.id} className="cart-item-card">
                                        <div className="item-checkbox">
                                            <label className="cart-checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.book.id)}
                                                    onChange={() => toggleSelect(item.book.id)}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                        <div className="item-image">
                                            <img src={item.book.bookImageUrl} alt={item.book.name} />
                                        </div>
                                        <div className="item-info">
                                            <Link to={`/shop/books/${item.book.id}`} className="item-name">
                                                {item.book.name}
                                            </Link>
                                            <div className="item-price-row">
                                                <span className="item-current-price">
                                                    {item.book.finalPrice.toLocaleString('vi-VN')} đ
                                                </span>
                                                {item.book.sale > 0 && (
                                                    <span className="item-old-price">
                                                        {item.book.originalCost.toLocaleString('vi-VN')} đ
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="item-quantity-col">
                                            <div className="item-quantity-control">
                                                <button onClick={() => updateQuantity(item.book.id, -1)}><Minus size={14} /></button>
                                                <input type="text" value={item.quantity} readOnly />
                                                <button onClick={() => updateQuantity(item.book.id, 1)}><Plus size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="item-subtotal-col">
                                            <span className="item-subtotal">
                                                {(item.book.finalPrice * item.quantity).toLocaleString('vi-VN')} đ
                                            </span>
                                        </div>
                                        <div className="item-remove-col">
                                            <button className="btn-remove-item" onClick={() => removeItem(item.book.id)}>
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Summary & Promotions */}
                        <div className="cart-sidebar-col">
                            <div className="cart-promo-card">
                                <div className="card-header">
                                    <div className="header-left">
                                        <Ticket size={20} color="#C92127" />
                                        <span>KHUYẾN MÃI</span>
                                    </div>
                                    <button className="btn-view-more">Xem thêm <ChevronRight size={14} /></button>
                                </div>
                                <div className="promo-item">
                                    <div className="promo-info">
                                        <div className="promo-title">Mã Giảm 10K - Toàn Sàn</div>
                                        <div className="promo-desc">Đơn hàng từ 130k - Không bao gồm giá trị của...</div>
                                        <div className="promo-progress">
                                            <div className="progress-bar"><div className="fill" style={{ width: '60%' }}></div></div>
                                            <span>Mua thêm 150.000 đ</span>
                                        </div>
                                    </div>
                                    <button className="btn-buy-more">Mua thêm</button>
                                    <Info size={16} color="#2489F3" className="promo-info-icon" />
                                </div>
                                <div className="promo-footer">
                                    <button className="btn-gift-guide">Hướng dẫn sử dụng Gift Card <Info size={14} /></button>
                                </div>
                            </div>

                            <div className="cart-gift-card">
                                <div className="card-header">
                                    <div className="header-left">
                                        <Gift size={20} color="#C92127" />
                                        <span>Nhận quà</span>
                                    </div>
                                    <button className="btn-view-more">Chọn quà <ChevronRight size={14} /></button>
                                </div>
                            </div>

                            <div className="cart-summary-card">
                                <div className="summary-row">
                                    <span>Thành tiền</span>
                                    <span>{subtotal.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="summary-total-row">
                                    <span>Tổng Số Tiền (gồm VAT)</span>
                                    <span className="total-value">{total.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <button
                                    className={`btn-checkout ${selectedIds.length === 0 ? 'disabled' : ''}`}
                                    disabled={selectedIds.length === 0}
                                >
                                    THANH TOÁN
                                </button>
                                <div className="checkout-note">(Giảm giá trên web chỉ áp dụng cho bán lẻ)</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
