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
    { book: book1, quantity: 1, priceSnapshot: 200000, bill: {} as any },
    { book: book2, quantity: 1, priceSnapshot: 450000, bill: {} as any }
];

// Bill 2: Completed
export const mockBillBooks2: BillBook[] = [
    { book: book3, quantity: 1, priceSnapshot: 150000, bill: {} as any }
];

// Bill 3: Canceled
export const mockBillBooks3: BillBook[] = [
    { book: book4, quantity: 2, priceSnapshot: 180000, bill: {} as any }
];


export const mockBills: Bill[] = [
    {
        id: 1,
        user: customer,
        paymentMethod: mockPaymentMethods[0], // COD
        shippingMethod: mockShippingMethods[0], // Standard
        totalCost: 665000, 
        status: BillStatus.PENDING,
        createdAt: '2023-09-02T10:00:00Z',
        billBooks: mockBillBooks1,
        transactions: [],
        eventLogs: []
    },
    {
        id: 2,
        user: customer,
        paymentMethod: mockPaymentMethods[1], // VNPay
        shippingMethod: mockShippingMethods[1], // Express
        totalCost: 185000, 
        status: BillStatus.COMPLETED,
        createdAt: '2023-08-15T09:00:00Z',
        approvedAt: '2023-08-15T09:30:00Z',
        billBooks: mockBillBooks2,
        transactions: [],
        eventLogs: []
    },
    {
        id: 3,
        user: customer2,
        paymentMethod: mockPaymentMethods[0], 
        shippingMethod: mockShippingMethods[0], 
        totalCost: 375000, 
        status: BillStatus.CANCELED,
        createdAt: '2023-09-01T14:00:00Z',
        billBooks: mockBillBooks3,
        transactions: [],
        eventLogs: []
    }
];

// Fix circular ref for Bill
mockBillBooks1.forEach(item => item.bill = mockBills[0]);
mockBillBooks2.forEach(item => item.bill = mockBills[1]);
mockBillBooks3.forEach(item => item.bill = mockBills[2]);
