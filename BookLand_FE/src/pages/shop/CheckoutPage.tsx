import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import {
    ShoppingBag,
    Truck,
    CreditCard,
    MapPin,
    User,
    Phone,
    Mail,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';
import '../../styles/shop.css';
import { mockCart } from '../../data/mockOrders';
import { mockShippingMethods, mockPaymentMethods } from '../../data/mockMasterData';
import type { CartItem } from '../../types/CartItem';
import type { ShippingMethod } from '../../types/ShippingMethod';
import type { PaymentMethod } from '../../types/PaymentMethod';



const CheckoutPage = () => {
    const navigate = useNavigate();

    // Mock data - In real app, this would come from cart state/context
    const [cartItems] = useState<CartItem[]>(mockCart.items || []);

    const [selectedShipping] = useState<ShippingMethod>(mockShippingMethods[1]); // Default to Express

    const [selectedPayment] = useState<PaymentMethod>(mockPaymentMethods[0]); // Default to COD

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        notes: '',
    });

    const [isProcessing, setIsProcessing] = useState(false);

    // Calculations
    const subtotal = cartItems.reduce((sum, item) => sum + item.book.originalCost * item.quantity, 0);
    const shippingFee = selectedShipping.price;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingFee + tax;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city) {
            alert('Please fill in all required fields');
            return;
        }

        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            alert('Order placed successfully! 🎉');
            navigate('/shop');
        }, 2000);
    };

    return (
        <div className="checkout-page">
            <div className="shop-container">
                {/* Header */}
                <div className="checkout-page__header">
                    <button
                        className="checkout-page__back-btn"
                        onClick={() => navigate('/shop/cart')}
                    >
                        <ArrowLeft size={20} />
                        Back to Cart
                    </button>
                    <h1 className="checkout-page__title">Checkout</h1>
                    <p className="checkout-page__subtitle">Complete your order</p>
                </div>

                <form onSubmit={handleSubmitOrder} className="checkout-page__content">
                    {/* Left Column - Forms */}
                    <div className="checkout-page__main">
                        {/* Shipping Information */}
                        <div className="checkout-section">
                            <div className="checkout-section__header">
                                <MapPin size={24} />
                                <h2 className="checkout-section__title">Shipping Information</h2>
                            </div>
                            <div className="checkout-section__content">
                                <div className="checkout-form">
                                    <div className="checkout-form__row">
                                        <div className="checkout-form__field">
                                            <label className="checkout-form__label">
                                                <User size={16} />
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="checkout-form__input"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="checkout-form__row checkout-form__row--two">
                                        <div className="checkout-form__field">
                                            <label className="checkout-form__label">
                                                <Mail size={16} />
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="checkout-form__input"
                                                placeholder="john@example.com"
                                                required
                                            />
                                        </div>
                                        <div className="checkout-form__field">
                                            <label className="checkout-form__label">
                                                <Phone size={16} />
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="checkout-form__input"
                                                placeholder="+84 123 456 789"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="checkout-form__row">
                                        <div className="checkout-form__field">
                                            <label className="checkout-form__label">
                                                <MapPin size={16} />
                                                Address *
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="checkout-form__input"
                                                placeholder="123 Main Street"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="checkout-form__row checkout-form__row--two">
                                        <div className="checkout-form__field">
                                            <label className="checkout-form__label">City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="checkout-form__input"
                                                placeholder="Hanoi"
                                                required
                                            />
                                        </div>
                                        <div className="checkout-form__field">
                                            <label className="checkout-form__label">Postal Code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                className="checkout-form__input"
                                                placeholder="100000"
                                            />
                                        </div>
                                    </div>

                                    <div className="checkout-form__row">
                                        <div className="checkout-form__field">
                                            <label className="checkout-form__label">Order Notes (Optional)</label>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                className="checkout-form__textarea"
                                                placeholder="Any special instructions for your order..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Selected Methods */}
                        <div className="checkout-section">
                            <div className="checkout-section__header">
                                <Truck size={24} />
                                <h2 className="checkout-section__title">Delivery & Payment</h2>
                            </div>
                            <div className="checkout-section__content">
                                <div className="checkout-methods">
                                    <div className="checkout-method">
                                        <div className="checkout-method__icon">
                                            <Truck size={20} />
                                        </div>
                                        <div className="checkout-method__content">
                                            <div className="checkout-method__label">Shipping Method</div>
                                            <div className="checkout-method__value">{selectedShipping.name}</div>
                                            <div className="checkout-method__detail">{selectedShipping.description}</div>
                                        </div>
                                        <div className="checkout-method__price">
                                            {formatCurrency(selectedShipping.price)}
                                        </div>
                                    </div>

                                    <div className="checkout-method">
                                        <div className="checkout-method__icon">
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="checkout-method__content">
                                            <div className="checkout-method__label">Payment Method</div>
                                            <div className="checkout-method__value">{selectedPayment.name}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="checkout-page__sidebar">
                        {/* Order Items */}
                        <div className="checkout-summary">
                            <div className="checkout-summary__header">
                                <ShoppingBag size={20} />
                                <h3 className="checkout-summary__title">Order Summary</h3>
                            </div>

                            <div className="checkout-summary__items">
                                {cartItems.map(item => (
                                    <div key={item.book.id} className="checkout-item">
                                        <div className="checkout-item__image-wrapper">
                                            <img
                                                src={item.book.bookImageUrl}
                                                alt={item.book.name}
                                                className="checkout-item__image"
                                            />
                                            <span className="checkout-item__quantity">{item.quantity}</span>
                                        </div>
                                        <div className="checkout-item__details">
                                            <div className="checkout-item__title">{item.book.name}</div>
                                            <div className="checkout-item__author">{item.book.author.name}</div>
                                        </div>
                                        <div className="checkout-item__price">
                                            {formatCurrency(item.book.originalCost * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>



                            {/* Price Breakdown */}
                            <div className="checkout-summary__breakdown">
                                <div className="checkout-summary__row">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="checkout-summary__row">
                                    <span>Shipping</span>
                                    <span>{formatCurrency(shippingFee)}</span>
                                </div>

                                <div className="checkout-summary__row">
                                    <span>Tax (10%)</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>
                                <div className="checkout-summary__divider"></div>
                                <div className="checkout-summary__row checkout-summary__row--total">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="checkout-submit"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        Confirm Payment
                                    </>
                                )}
                            </button>

                            <div className="checkout-summary__notice">
                                <CheckCircle size={14} />
                                Your payment information is secure
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
