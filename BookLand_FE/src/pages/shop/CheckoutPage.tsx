import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Truck,
    CreditCard,
    MapPin,
    User as UserIcon,
    Phone,
    Mail,
    CheckCircle,
    ArrowLeft,
    ChevronRight,
    ShoppingBag,
    Package
} from 'lucide-react';
import '../../styles/pages/checkout.css';
import { formatCurrency } from '../../utils/formatters';
import { getCurrentUserId } from '../../utils/auth';
import { toast } from 'react-toastify';
import cartService from '../../api/cartService';
import userService from '../../api/userService';
import billService from '../../api/billService';
import shippingMethodService from '../../api/shippingMethodService';
import paymentMethodService from '../../api/paymentMethodService';
import type { CartItem } from '../../types/CartItem';
import type { ShippingMethod } from '../../types/ShippingMethod';
import type { PaymentMethod } from '../../types/PaymentMethod';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const checkoutData = location.state || {};

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: 'Hà Nội',
        notes: '',
    });

    useEffect(() => {
        const loadCheckoutData = async () => {
            const userId = getCurrentUserId();
            if (!userId) {
                toast.error('Vui lòng đăng nhập để thanh toán');
                navigate('/shop/login');
                return;
            }

            if (!checkoutData.selectedBookIds || checkoutData.selectedBookIds.length === 0) {
                toast.warning('Không có sản phẩm nào được chọn để thanh toán');
                navigate('/shop/cart');
                return;
            }

            setIsLoading(true);
            try {
                // Load User Info
                const userRes = await userService.getUserById(userId);
                if (userRes.result) {
                    const u = userRes.result;
                    setFormData(prev => ({
                        ...prev,
                        fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
                        email: u.email,
                        phone: u.phone || '',
                        address: u.addresses?.[0]?.addressDetail || '',
                        city: 'Hà Nội', // Address type doesn't have city, defaulting to Hanoi
                    }));
                }

                // Load Cart Items
                const cartRes = await cartService.getUserCart(userId);
                if (cartRes.result) {
                    const selectedItems = cartRes.result.items.filter((item: CartItem) =>
                        checkoutData.selectedBookIds.includes(item.bookId)
                    );
                    setCartItems(selectedItems);
                }

                // Load Shipping Method
                if (checkoutData.shippingMethodId) {
                    const shipRes = await shippingMethodService.getShippingMethodById(checkoutData.shippingMethodId);
                    if (shipRes.result) setShippingMethod(shipRes.result);
                }

                // Load Payment Method
                if (checkoutData.paymentMethodId) {
                    const payRes = await paymentMethodService.getById(checkoutData.paymentMethodId);
                    if (payRes.result) setPaymentMethod(payRes.result);
                }

            } catch (error) {
                console.error('Failed to load checkout data:', error);
                toast.error('Có lỗi xảy ra khi tải thông tin thanh toán');
            } finally {
                setIsLoading(false);
            }
        };

        loadCheckoutData();
    }, [checkoutData, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.address) {
            toast.warning('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        if (!shippingMethod || !paymentMethod) {
            toast.warning('Thiếu thông tin vận chuyển hoặc thanh toán');
            return;
        }

        setIsProcessing(true);
        try {
            const billRequest = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                notes: formData.notes,
                paymentMethodId: paymentMethod.id,
                shippingMethodId: shippingMethod.id,
                books: cartItems.map(item => ({
                    bookId: item.bookId,
                    quantity: item.quantity
                }))
            };

            const response = await billService.createBill(billRequest);

            if (response.result) {
                toast.success('Đặt hàng thành công! 🎉');
                window.dispatchEvent(new Event('cart:updated'));

                // If VNPAY or online payment, could handle redirect here
                // For now, go to profile/orders
                navigate('/shop/profile', { state: { activeTab: 'orders' } });
            }
        } catch (error) {
            console.error('Failed to place order:', error);
            toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = shippingMethod?.price || 0;
    const total = subtotal + shippingFee;

    if (isLoading) {
        return (
            <div className="checkout-page">
                <div className="shop-container">
                    <div className="loading-state">
                        <div className="loader"></div>
                        <p>Đang chuẩn bị thông tin thanh toán...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="shop-container">
                {/* Breadcrumbs-style Progress */}
                <div className="checkout-steps">
                    <div className="step done" onClick={() => navigate('/shop/cart')}>
                        <span>Giỏ hàng</span>
                        <ChevronRight size={16} />
                    </div>
                    <div className="step active">
                        <span>Thanh toán</span>
                        <ChevronRight size={16} />
                    </div>
                    <div className="step">
                        <span>Hoàn tất</span>
                    </div>
                </div>

                <div className="checkout-title-row">
                    <button className="btn-back" onClick={() => navigate('/shop/cart')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>XÁC NHẬN THANH TOÁN</h1>
                </div>

                <form onSubmit={handleSubmitOrder} className="checkout-grid">
                    {/* Left Column: Info Forms */}
                    <div className="checkout-main-col">
                        {/* Shipping Address Section */}
                        <div className="checkout-card">
                            <div className="card-header">
                                <MapPin size={22} color="#C92127" />
                                <h2>ĐỊA CHỈ GIAO HÀNG</h2>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Họ và tên người nhận</label>
                                    <div className="input-with-icon">
                                        <UserIcon size={18} />
                                        <input
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Nhập họ và tên"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <div className="input-with-icon">
                                            <Phone size={18} />
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="Nhập số điện thoại"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <div className="input-with-icon">
                                            <Mail size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Địa chỉ email"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Địa chỉ nhận hàng</label>
                                    <div className="input-with-icon">
                                        <MapPin size={18} />
                                        <input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Số nhà, tên đường, phường/xã..."
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Ghi chú cho đơn hàng</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Review Methods Section */}
                        <div className="checkout-card">
                            <div className="card-header">
                                <Package size={22} color="#C92127" />
                                <h2>PHƯƠNG THỨC VẬN CHUYỂN & THANH TOÁN</h2>
                            </div>
                            <div className="card-body methods-review">
                                <div className="method-review-item">
                                    <div className="icon-box"><Truck size={20} /></div>
                                    <div className="method-info">
                                        <span className="label">Vận chuyển:</span>
                                        <span className="value">{shippingMethod?.name}</span>
                                        <span className="price">({formatCurrency(shippingFee)})</span>
                                    </div>
                                </div>
                                <div className="method-review-item">
                                    <div className="icon-box"><CreditCard size={20} /></div>
                                    <div className="method-info">
                                        <span className="label">Thanh toán:</span>
                                        <span className="value">{paymentMethod?.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="checkout-sidebar-col">
                        <div className="checkout-summary-card">
                            <div className="card-header">
                                <ShoppingBag size={20} color="#333" />
                                <h3>KIỂM TRA ĐƠN HÀNG</h3>
                            </div>

                            <div className="checkout-items-preview">
                                {cartItems.map(item => (
                                    <div key={item.bookId} className="preview-item">
                                        <div className="item-img">
                                            <img src={item.bookImageUrl} alt={item.bookName} />
                                        </div>
                                        <div className="item-meta">
                                            <div className="name">{item.bookName}</div>
                                            <div className="price">{formatCurrency(item.finalPrice)}</div>
                                        </div>
                                        <div className="item-qty">
                                            x{item.quantity}
                                        </div>
                                        <div className="item-total">
                                            {formatCurrency(item.subtotal)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-breakdown">
                                <div className="row">
                                    <span>Tạm tính</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="row">
                                    <span>Phí vận chuyển</span>
                                    <span>{formatCurrency(shippingFee)}</span>
                                </div>
                                <div className="divider"></div>
                                <div className="row total">
                                    <span>Tổng cộng</span>
                                    <span className="final-total">{formatCurrency(total)}</span>
                                </div>
                                <div className="vat-notice">(Đã bao gồm VAT nếu có)</div>
                            </div>

                            <button
                                type="submit"
                                className={`btn-place-order ${isProcessing ? 'loading' : ''}`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
                            </button>

                            <div className="security-shield">
                                <CheckCircle size={14} />
                                Cam kết bảo mật thông tin thanh toán
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
