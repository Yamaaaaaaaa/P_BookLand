import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import '../styles/components/featured-bookcases.css';
import bookService from '../api/bookService';
import type { Book } from '../types/Book';
import { useTranslation } from 'react-i18next';

const FeaturedBookcases = ({ itemLimit = 8 }: { itemLimit?: number }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchPinnedBooks = async () => {
            try {
                const response = await bookService.getAllBooks({
                    pinned: true,
                    page: 0,
                    size: itemLimit
                });
                if (response.result && response.result.content) {
                    setBooks(response.result.content);
                }
            } catch (error) {
                console.error("Failed to fetch featured bookcases", error);
            }
        };

        fetchPinnedBooks();
    }, [itemLimit]);

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

    return (
        <section className="featured-bookcases">
            <div className="bookcases-container">
                <div className="bookcases-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="bookcases-icon-box">
                            <BookOpen size={20} color="white" fill="white" />
                        </div>
                        <h2 className="bookcases-title">{t('home.featured_bookcases.title')}</h2>
                    </div>
                </div>
                <div className="bookcases-grid-wrapper" style={{ position: 'relative' }}>
                    {books.length > 5 && (
                        <button className="nav-prev" onClick={scrollLeft}>&lt;</button>
                    )}
                    <div className="bookcases-grid" ref={scrollRef}>
                    {books.map((book) => (
                        <Link key={book.id} to={`/shop/book-detail/${book.id}`} className="bookcase-item">
                            <div className="bookcase-image-wrapper">
                                <img src={book.bookImageUrl} alt={book.name} className="bookcase-image" />
                            </div>
                            <span className="bookcase-name">{book.name}</span>
                        </Link>
                    ))}
                    </div>
                    {books.length > 5 && (
                        <button className="nav-next" onClick={scrollRight}>&gt;</button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FeaturedBookcases;
