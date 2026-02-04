import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Truck, CreditCard } from 'lucide-react';
import '../../styles/pages/cart.css';
import cartService from '../../api/cartService';
import shippingMethodService from '../../api/shippingMethodService';
import paymentMethodService from '../../api/paymentMethodService';
import { getCurrentUserId } from '../../utils/auth';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/formatters';
import type { CartItem } from '../../types/CartItem';
import type { ShippingMethod } from '../../types/ShippingMethod';
import type { PaymentMethod } from '../../types/PaymentMethod';

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

    const fetchData = async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            toast.warning('Vui lòng đăng nhập để xem giỏ hàng');
            navigate('/shop/login');
            return;
        }

        setIsLoading(true);
        try {
            // Fetch cart
            const cartRes = await cartService.getUserCart(userId);
            if (cartRes.result && cartRes.result.items) {
                setCartItems(cartRes.result.items);
                if (selectedIds.length === 0) {
                    setSelectedIds(cartRes.result.items.map((item: CartItem) => item.bookId));
                }
            }

            // Fetch shipping methods
            const shipRes = await shippingMethodService.getAllShippingMethods();
            if (shipRes.result && shipRes.result.content) {
                setShippingMethods(shipRes.result.content);
                if (shipRes.result.content.length > 0) {
                    setSelectedShippingId(shipRes.result.content[0].id);
                }
            }

            // Fetch payment methods
            const payRes = await paymentMethodService.getAll();
            if (payRes.result && payRes.result.content) {
                setPaymentMethods(payRes.result.content);
                if (payRes.result.content.length > 0) {
                    setSelectedPaymentId(payRes.result.content[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Không thể tải thông tin giỏ hàng');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateQuantity = async (bookId: number, currentQuantity: number, delta: number) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        const newQuantity = currentQuantity + delta;
        if (newQuantity < 1) return;

        try {
            await cartService.updateCartItem(userId, bookId, { quantity: newQuantity });
            // Refresh cart
            const cartRes = await cartService.getUserCart(userId);
            if (cartRes.result) {
                setCartItems(cartRes.result.items);
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
            toast.error('Không thể cập nhật số lượng');
        }
    };

    const removeItem = async (bookId: number) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        try {
            await cartService.removeFromCart(userId, bookId);
            setCartItems(items => items.filter(item => item.bookId !== bookId));
            setSelectedIds(ids => ids.filter(id => id !== bookId));
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
            window.dispatchEvent(new Event('cart:updated'));
        } catch (error) {
            console.error('Failed to remove item:', error);
            toast.error('Không thể xóa sản phẩm');
        }
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
            setSelectedIds(cartItems.map(item => item.bookId));
        }
    };

    const selectedItemsList = cartItems.filter(item => selectedIds.includes(item.bookId));
    const itemsSubtotal = selectedItemsList.reduce((sum, item) => sum + item.subtotal, 0);

    const selectedShipping = shippingMethods.find(s => s.id === selectedShippingId);
    const shippingPrice = selectedShipping ? selectedShipping.price : 0;

    const totalAmount = itemsSubtotal + shippingPrice;

    if (isLoading && cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="shop-container">
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Đang tải giỏ hàng...</p>
                    </div>
                </div>
            </div>
        );
    }

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
                                    <span className="bar-label-qty">Số lượng</span>
                                    <span className="bar-label-subtotal">Thành tiền</span>
                                    <div className="bar-label-spacer"></div>
                                </div>
                            </div>

                            <div className="cart-items-list">
                                {cartItems.map(item => (
                                    <div key={item.bookId} className="cart-item-card">
                                        <div className="item-checkbox">
                                            <label className="cart-checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.bookId)}
                                                    onChange={() => toggleSelect(item.bookId)}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                        <div className="item-image">
                                            <img src={item.bookImageUrl || 'https://via.placeholder.com/150'} alt={item.bookName} />
                                        </div>
                                        <div className="item-info">
                                            <Link to={`/shop/book-detail/${item.bookId}`} className="item-name">
                                                {item.bookName}
                                            </Link>
                                            <div className="item-price-row">
                                                <span className="item-current-price">
                                                    {formatCurrency(item.finalPrice)}
                                                </span>
                                                {item.salePrice > 0 && (
                                                    <span className="item-old-price">
                                                        {formatCurrency(item.originalPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="item-quantity-col">
                                            <div className="item-quantity-control">
                                                <button onClick={() => updateQuantity(item.bookId, item.quantity, -1)}><Minus size={14} /></button>
                                                <input type="text" value={item.quantity} readOnly />
                                                <button onClick={() => updateQuantity(item.bookId, item.quantity, 1)}><Plus size={14} /></button>
                                            </div>
                                            <div className="item-available-stock">
                                                Còn {item.availableStock} sp
                                            </div>
                                        </div>
                                        <div className="item-subtotal-col">
                                            <span className="item-subtotal">
                                                {formatCurrency(item.subtotal)}
                                            </span>
                                        </div>
                                        <div className="item-remove-col">
                                            <button className="btn-remove-item" onClick={() => removeItem(item.bookId)}>
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Checkout Config & Summary */}
                        <div className="cart-sidebar-col">
                            <div className="checkout-config-card">
                                {/* Shipping Method */}
                                <div className="config-section">
                                    <div className="config-title">
                                        <Truck size={18} color="#C92127" />
                                        <span>PHƯƠNG THỨC VẬN CHUYỂN</span>
                                    </div>
                                    <div className="config-options">
                                        {shippingMethods.map(method => (
                                            <label
                                                key={method.id}
                                                className={`option-item ${selectedShippingId === method.id ? 'active' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="shippingMethod"
                                                    className="option-radio"
                                                    checked={selectedShippingId === method.id}
                                                    onChange={() => setSelectedShippingId(method.id)}
                                                />
                                                <div className="option-info">
                                                    <span className="option-name">{method.name}</span>
                                                    <span className="option-price">{formatCurrency(method.price)}</span>
                                                    {method.description && <span className="option-desc">{method.description}</span>}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="config-section">
                                    <div className="config-title">
                                        <CreditCard size={18} color="#C92127" />
                                        <span>PHƯƠNG THỨC THANH TOÁN</span>
                                    </div>
                                    <div className="config-options">
                                        {paymentMethods.map(method => (
                                            <label
                                                key={method.id}
                                                className={`option-item ${selectedPaymentId === method.id ? 'active' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    className="option-radio"
                                                    checked={selectedPaymentId === method.id}
                                                    onChange={() => setSelectedPaymentId(method.id)}
                                                />
                                                <div className="option-info">
                                                    <span className="option-name">{method.name}</span>
                                                    {method.description && <span className="option-desc">{method.description}</span>}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="cart-summary-card">
                                <div className="summary-row">
                                    <span>Thành tiền</span>
                                    <span>{formatCurrency(itemsSubtotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Phí vận chuyển</span>
                                    <span>{formatCurrency(shippingPrice)}</span>
                                </div>
                                <div className="summary-total-row">
                                    <span>Tổng Số Tiền</span>
                                    <span className="total-value">{formatCurrency(totalAmount)}</span>
                                </div>
                                <button
                                    className={`btn-checkout ${selectedIds.length === 0 ? 'disabled' : ''}`}
                                    disabled={selectedIds.length === 0}
                                    onClick={() => navigate('/shop/checkout', {
                                        state: {
                                            selectedBookIds: selectedIds,
                                            shippingMethodId: selectedShippingId,
                                            paymentMethodId: selectedPaymentId
                                        }
                                    })}
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
