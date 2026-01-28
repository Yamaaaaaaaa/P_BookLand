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
const book1 = mockBooks[0];
const book2 = mockBooks[1];

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

// Fix circular ref for Cart
mockCartItems.forEach(item => item.cart = mockCart);

// --- BILL ---
export const mockBillBooks: BillBook[] = [
    { book: book1, quantity: 1, priceSnapshot: 200000, bill: {} as any },
    { book: book2, quantity: 1, priceSnapshot: 450000, bill: {} as any } // sale price
];

export const mockBills: Bill[] = [
    {
        id: 1,
        user: customer,
        paymentMethod: mockPaymentMethods[0], // COD
        shippingMethod: mockShippingMethods[0], // Standard
        totalCost: 665000, // 200 + 450 + 15 shipping
        status: BillStatus.PENDING,
        createdAt: '2023-09-02T10:00:00Z',
        billBooks: mockBillBooks,
        transactions: [],
        eventLogs: []
    }
];

// Fix circular ref for Bill
mockBillBooks.forEach(item => item.bill = mockBills[0]);
