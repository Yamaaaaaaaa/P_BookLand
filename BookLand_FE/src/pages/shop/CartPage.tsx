import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, CreditCard } from 'lucide-react';
import '../../styles/pages/cart.css';
import '../../styles/components/buttons.css';
import { mockCart } from '../../data/mockOrders';
import { mockPaymentMethods, mockShippingMethods } from '../../data/mockMasterData';
import type { CartItem } from '../../types/CartItem';

// Helper to keep local state for demo purposes, initialized from mock data
const CartPage = () => {
    // In a real app, this would be global state or API data
    const [cartItems, setCartItems] = useState<CartItem[]>(mockCart.items || []);

    const [selectedShipping, setSelectedShipping] = useState<number>(0);
    const [selectedPayment, setSelectedPayment] = useState<number>(0);

    // const shippingMethods... removed
    // const paymentMethods... removed

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
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.book.originalCost * item.quantity, 0);

    // Calculate shipping fee based on selected method
    const getShippingFee = () => {
        if (!selectedShipping) return 0;
        const method = mockShippingMethods.find(m => m.id === selectedShipping);
        return method ? method.price : 0;
    };

    const shippingFee = getShippingFee();
    const tax = subtotal * 0.1;
    const total = subtotal + shippingFee + tax;

    const canProceedToCheckout = selectedShipping && selectedPayment;

    return (
        <div className="cart-page">
            <div className="shop-container">
                {/* Page Header */}
                <div className="cart-page__header">
                    <h1 className="cart-page__title">Shopping Cart</h1>
                    <p className="cart-page__count">{cartItems.length} items in your cart</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="cart-page__empty">
                        <ShoppingBag size={64} />
                        <h2>Your cart is empty</h2>
                        <p>Add some books to get started!</p>
                        <Link to="/shop/books" className="btn-primary btn-primary--large">
                            Browse Books
                        </Link>
                    </div>
                ) : (
                    <div className="cart-page__content">
                        {/* Cart Items */}
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.book.id} className="cart-item">
                                    <div className="cart-item__image-wrapper">

                                        <img
                                            src={item.book.bookImageUrl}
                                            alt={item.book.name}
                                            className="cart-item__image"
                                        />
                                    </div>

                                    <div className="cart-item__details">
                                        <h3 className="cart-item__title">{item.book.name}</h3>
                                        <p className="cart-item__author">by {item.book.author.name}</p>
                                        <p className="cart-item__price">{formatCurrency(item.book.originalCost)}</p>
                                    </div>

                                    <div className="cart-item__actions">
                                        <div className="cart-item__quantity">
                                            <button
                                                className="cart-item__qty-btn"
                                                onClick={() => updateQuantity(item.book.id, -1)}
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="cart-item__qty-value">{item.quantity}</span>
                                            <button
                                                className="cart-item__qty-btn"
                                                onClick={() => updateQuantity(item.book.id, 1)}
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button
                                            className="cart-item__remove"
                                            onClick={() => removeItem(item.book.id)}
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={18} />
                                            Remove
                                        </button>
                                    </div>

                                    <div className="cart-item__total">
                                        {formatCurrency(item.book.originalCost * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="cart-summary">
                            <h2 className="cart-summary__title">Order Summary</h2>

                            <div className="cart-summary__row">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>

                            {/* Shipping Method Selection */}
                            <div className="cart-summary__section">
                                <h3 className="cart-summary__section-title">
                                    <Truck size={18} />
                                    Shipping Method
                                </h3>
                                <div className="cart-summary__options">
                                    {mockShippingMethods.map(method => (
                                        <div
                                            key={method.id}
                                            className={`cart-summary__option ${selectedShipping === method.id ? 'cart-summary__option--selected' : ''}`}
                                            onClick={() => setSelectedShipping(method.id)}
                                        >
                                            <div className="cart-summary__option-header">
                                                <div className="cart-summary__option-radio">
                                                    {selectedShipping === method.id && <div className="cart-summary__option-radio-dot" />}
                                                </div>
                                                <div className="cart-summary__option-content">
                                                    <div className="cart-summary__option-name">{method.name}</div>
                                                    <div className="cart-summary__option-desc">{method.description}</div>
                                                    {/* <div className="cart-summary__option-time">{method.estimatedDays}</div> */}
                                                </div>
                                                <div className="cart-summary__option-price">
                                                    {formatCurrency(method.price)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="cart-summary__section">
                                <h3 className="cart-summary__section-title">
                                    <CreditCard size={18} />
                                    Payment Method
                                </h3>
                                <div className="cart-summary__options">
                                    {mockPaymentMethods.map(method => (
                                        <div
                                            key={method.id}
                                            className={`cart-summary__option ${selectedPayment === method.id ? 'cart-summary__option--selected' : ''}`}
                                            onClick={() => setSelectedPayment(method.id)}
                                        >
                                            <div className="cart-summary__option-header">
                                                <div className="cart-summary__option-radio">
                                                    {selectedPayment === method.id && <div className="cart-summary__option-radio-dot" />}
                                                </div>
                                                <div className="cart-summary__option-content">
                                                    <div className="cart-summary__option-name">
                                                        {/* <span className="cart-summary__option-icon">{method.icon}</span> */}
                                                        {method.name}
                                                    </div>
                                                    <div className="cart-summary__option-desc">{method.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="cart-summary__row">
                                <span>Shipping</span>
                                <span>
                                    {!selectedShipping
                                        ? 'Select method'
                                        : shippingFee === 0
                                            ? 'FREE'
                                            : formatCurrency(shippingFee)
                                    }
                                </span>
                            </div>

                            <div className="cart-summary__row">
                                <span>Tax (10%)</span>
                                <span>{formatCurrency(tax)}</span>
                            </div>

                            <div className="cart-summary__divider"></div>

                            <div className="cart-summary__row cart-summary__row--total">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>

                            {!canProceedToCheckout && (
                                <div className="cart-summary__notice cart-summary__notice--warning">
                                    Please select shipping and payment method
                                </div>
                            )}

                            {subtotal < 500000 && selectedShipping === 1 && (
                                <div className="cart-summary__notice">
                                    Add {formatCurrency(500000 - subtotal)} more for free standard shipping!
                                </div>
                            )}

                            {canProceedToCheckout ? (
                                <Link to="/shop/checkout" className="btn-primary btn-primary--large btn-primary--full">
                                    Proceed to Checkout
                                    <ArrowRight size={18} />
                                </Link>
                            ) : (
                                <button
                                    className="btn-primary btn-primary--large btn-primary--full btn-primary--disabled"
                                    disabled
                                >
                                    Proceed to Checkout
                                    <ArrowRight size={18} />
                                </button>
                            )}

                            <Link to="/shop/books" className="cart-summary__continue">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
