import BookCard from './BookCard';
import '../styles/shop.css';
import type { Book } from '../types/Book';

interface BookGridProps {
    books: Book[];
    columns?: 3 | 4;
}

const BookGrid = ({ books, columns = 4 }: BookGridProps) => {
    if (books.length === 0) {
        return (
            <div className="book-grid__empty">
                <p>No books found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className={`book-grid book-grid--cols-${columns}`}>
            {books.map((book) => (
                <div key={book.id} className="book-grid__link">
                    <BookCard book={book} />
                </div>
            ))}
        </div>
    );
};

export default BookGrid;
