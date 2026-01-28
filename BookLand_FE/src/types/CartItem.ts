import type { Cart } from './Cart';
import type { Book } from './Book';

export interface CartItem {
    cart: Cart;
    book: Book;
    quantity: number;
}
