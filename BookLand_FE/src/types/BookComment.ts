import type { Book } from './Book.ts';
import type { User } from './User.ts';

export interface BookComment {
    id: number;
    book: Book;
    user: User;
    comment?: string;
    rating: number;
    createdAt?: string;
}
