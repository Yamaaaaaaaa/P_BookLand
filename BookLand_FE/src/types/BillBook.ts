import type { Bill } from "./Bill";
import type { Book } from "./Book";


export interface BillBook {
    bill: Bill;
    book: Book;
    priceSnapshot: number;
    quantity: number;
}
    