import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, CreditCard, Banknote, Wallet } from 'lucide-react';
import '../../styles/shop.css';

interface CartItem {
    id: string;
    title: string;
    author: string;
    price: number;
    image: string;
    quantity: number;
}

interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDays: string;
}

interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
}

const CartPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: '1',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            price: 12.99,
            image: '/src/assets/book1.jpg',
            quantity: 1,
        },
        {
            id: '2',
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            price: 14.99,
            image: '/src/assets/book2.jpg',
            quantity: 2,
        },
        {
            id: '3',
            title: '1984',
            author: 'George Orwell',
            price: 13.99,
            image: '/src/assets/book3.jpg',
            quantity: 1,
        },
    ]);

    const [selectedShipping, setSelectedShipping] = useState<string>('');
    const [selectedPayment, setSelectedPayment] = useState<string>('');

    const shippingMethods: ShippingMethod[] = [
        {
            id: 'standard',
            name: 'Standard Shipping',
            description: 'Free shipping on orders over $50',
            price: 0,
            estimatedDays: '5-7 business days',
        },
        {
            id: 'express',
            name: 'Express Shipping',
            description: 'Faster delivery',
            price: 9.99,
            estimatedDays: '2-3 business days',
        },
        {
            id: 'overnight',
            name: 'Overnight Shipping',
            description: 'Next day delivery',
            price: 19.99,
            estimatedDays: '1 business day',
        },
    ];

    const paymentMethods: PaymentMethod[] = [
        {
            id: 'credit-card',
            name: 'Credit Card',
            description: 'Pay with Visa, Mastercard, or Amex',
            icon: <CreditCard size={20} />,
        },
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Fast and secure payment',
            icon: <Wallet size={20} />,
        },
        {
            id: 'cod',
            name: 'Cash on Delivery',
            description: 'Pay when you receive',
            icon: <Banknote size={20} />,
        },
    ];

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(items =>
            items.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const removeItem = (id: string) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Calculate shipping fee based on selected method
    const getShippingFee = () => {
        if (!selectedShipping) return 0;
        const method = shippingMethods.find(m => m.id === selectedShipping);
        if (!method) return 0;

        // Standard shipping is free for orders over $50
        if (method.id === 'standard' && subtotal >= 50) {
            return 0;
        }
        return method.price;
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
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item__image-wrapper">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="cart-item__image"
                                        />
                                    </div>

                                    <div className="cart-item__details">
                                        <h3 className="cart-item__title">{item.title}</h3>
                                        <p className="cart-item__author">by {item.author}</p>
                                        <p className="cart-item__price">${item.price.toFixed(2)}</p>
                                    </div>

                                    <div className="cart-item__actions">
                                        <div className="cart-item__quantity">
                                            <button
                                                className="cart-item__qty-btn"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="cart-item__qty-value">{item.quantity}</span>
                                            <button
                                                className="cart-item__qty-btn"
                                                onClick={() => updateQuantity(item.id, 1)}
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button
                                            className="cart-item__remove"
                                            onClick={() => removeItem(item.id)}
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={18} />
                                            Remove
                                        </button>
                                    </div>

                                    <div className="cart-item__total">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="cart-summary">
                            <h2 className="cart-summary__title">Order Summary</h2>

                            <div className="cart-summary__row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            {/* Shipping Method Selection */}
                            <div className="cart-summary__section">
                                <h3 className="cart-summary__section-title">
                                    <Truck size={18} />
                                    Shipping Method
                                </h3>
                                <div className="cart-summary__options">
                                    {shippingMethods.map(method => (
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
                                                    <div className="cart-summary__option-time">{method.estimatedDays}</div>
                                                </div>
                                                <div className="cart-summary__option-price">
                                                    {method.id === 'standard' && subtotal >= 50
                                                        ? 'FREE'
                                                        : method.price === 0
                                                            ? `$${(subtotal < 50 ? 5.99 : 0).toFixed(2)}`
                                                            : `$${method.price.toFixed(2)}`
                                                    }
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
                                    {paymentMethods.map(method => (
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
                                                        <span className="cart-summary__option-icon">{method.icon}</span>
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
                                            : `$${shippingFee.toFixed(2)}`
                                    }
                                </span>
                            </div>

                            <div className="cart-summary__row">
                                <span>Tax (10%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>

                            <div className="cart-summary__divider"></div>

                            <div className="cart-summary__row cart-summary__row--total">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            {!canProceedToCheckout && (
                                <div className="cart-summary__notice cart-summary__notice--warning">
                                    Please select shipping and payment method
                                </div>
                            )}

                            {subtotal < 50 && selectedShipping === 'standard' && (
                                <div className="cart-summary__notice">
                                    Add ${(50 - subtotal).toFixed(2)} more for free standard shipping!
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
