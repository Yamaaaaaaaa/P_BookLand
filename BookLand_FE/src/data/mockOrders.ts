import type { Cart } from '../types/Cart';
import { CartStatus } from '../types/Cart';
import type { CartItem } from '../types/CartItem';
import type { Bill } from '../types/Bill';
import { BillStatus } from '../types/Bill';
import type { BillBook } from '../types/BillBook';
import { mockUsers } from './mockUsers';
import { mockBooks } from './mockBooks';
import { mockPaymentMethods, mockShippingMethods } from './mockMasterData';

const customer = mockUsers[1];
const customer2 = mockUsers[3];
const book1 = mockBooks[0];
const book2 = mockBooks[1];
const book3 = mockBooks[2];
const book4 = mockBooks[3];

// --- CART ---
export const mockCartItems: CartItem[] = [
    { book: book1, quantity: 2, cart: {} as any },
    { book: book2, quantity: 1, cart: {} as any }
];

export const mockCart: Cart = {
    id: 1,
    user: customer,
    status: CartStatus.BUYING,
    createdAt: '2023-09-01T10:00:00Z',
    items: mockCartItems
};

const mockCartItems2: CartItem[] = [
    { book: book3, quantity: 1, cart: {} as any }
];

export const mockCart2: Cart = {
    id: 2,
    user: customer2,
    status: CartStatus.BUYING,
    createdAt: '2023-09-05T11:00:00Z',
    items: mockCartItems2
};

// Fix circular ref for Cart
mockCartItems.forEach(item => item.cart = mockCart);
mockCartItems2.forEach(item => item.cart = mockCart2);

// --- BILL ---
// Bill 1: Pending
export const mockBillBooks1: BillBook[] = [
    { 
        bookId: book1.id, 
        bookName: book1.name, 
        bookImageUrl: book1.bookImageUrl, 
        quantity: 1, 
        priceSnapshot: 200000,
        subtotal: 200000 
    },
    { 
        bookId: book2.id, 
        bookName: book2.name, 
        bookImageUrl: book2.bookImageUrl, 
        quantity: 1, 
        priceSnapshot: 450000,
        subtotal: 450000
    }
];

// Bill 2: Completed
export const mockBillBooks2: BillBook[] = [
    { 
        bookId: book3.id, 
        bookName: book3.name, 
        bookImageUrl: book3.bookImageUrl, 
        quantity: 1, 
        priceSnapshot: 150000,
        subtotal: 150000
    }
];

// Bill 3: Canceled
export const mockBillBooks3: BillBook[] = [
    { 
        bookId: book4.id, 
        bookName: book4.name, 
        bookImageUrl: book4.bookImageUrl, 
        quantity: 2, 
        priceSnapshot: 180000,
        subtotal: 360000
    }
];


export const mockBills: Bill[] = [
    {
        id: 1,
        userId: customer.id,
        userName: customer.username,
        paymentMethodId: mockPaymentMethods[0].id,
        paymentMethodName: mockPaymentMethods[0].name,
        shippingMethodId: mockShippingMethods[0].id,
        shippingMethodName: mockShippingMethods[0].name,
        shippingCost: mockShippingMethods[0].price,
        totalCost: 665000, 
        status: BillStatus.PENDING,
        createdAt: '2023-09-02T10:00:00Z',
        books: mockBillBooks1,
        transactions: [],
        eventLogs: []
    },
    {
        id: 2,
        userId: customer.id,
        userName: customer.username,
        paymentMethodId: mockPaymentMethods[1].id,
        paymentMethodName: mockPaymentMethods[1].name,
        shippingMethodId: mockShippingMethods[1].id,
        shippingMethodName: mockShippingMethods[1].name,
        shippingCost: mockShippingMethods[1].price,
        totalCost: 185000, 
        status: BillStatus.COMPLETED,
        createdAt: '2023-08-15T09:00:00Z',
        approvedAt: '2023-08-15T09:30:00Z',
        books: mockBillBooks2,
        transactions: [],
        eventLogs: []
    },
    {
        id: 3,
        userId: customer2.id,
        userName: customer2.username,
        paymentMethodId: mockPaymentMethods[0].id,
        paymentMethodName: mockPaymentMethods[0].name,
        shippingMethodId: mockShippingMethods[0].id,
        shippingMethodName: mockShippingMethods[0].name,
        shippingCost: mockShippingMethods[0].price,
        totalCost: 375000, 
        status: BillStatus.CANCELED,
        createdAt: '2023-09-01T14:00:00Z',
        books: mockBillBooks3,
        transactions: [],
        eventLogs: []
    }
];

// Fix circular ref for Bill
// mockBillBooks1.forEach(item => item.bill = mockBills[0]);
// mockBillBooks2.forEach(item => item.bill = mockBills[1]);
// mockBillBooks3.forEach(item => item.bill = mockBills[2]);
