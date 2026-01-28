import type { User } from '.';
import type { Author } from './Author';
import type { Publisher } from './Publisher';
import type { Serie } from './Serie';
import type { Category } from './Category';
import type { CartItem } from './CartItem';
import type { BillBook } from './BillBook';
import type { Wishlist } from './Wishlist';
import type { BookComment } from './BookComment';
import type { PurchaseInvoiceBook } from './PurchaseInvoiceBook';

export const BookStatus = {
    ENABLE: 'ENABLE',
    DISABLE: 'DISABLE'
} as const;

export type BookStatus = (typeof BookStatus)[keyof typeof BookStatus];

export interface Book {
    id: number;
    name: string;
    description?: string;
    originalCost: number;
    sale: number;
    stock: number;
    status: BookStatus;
    publishedDate?: string;
    bookImageUrl?: string;
    pin: boolean;
    author: Author;
    publisher: Publisher;
    series?: Serie;
    creator?: User;
    createdAt?: string;
    updatedAt?: string;
    categories?: Category[];
    cartItems?: CartItem[];
    billBooks?: BillBook[];
    wishlists?: Wishlist[];
    comments?: BookComment[];
    purchaseInvoiceBooks?: PurchaseInvoiceBook[];
    // Helper method from backend is not part of the interface usually, 
    // but if we used a class it would be. For now, interfaces only.
}
