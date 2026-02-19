
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import '../styles/components/flash-sale.css';
import bookService from '../api/bookService';
import type { Book } from '../types/Book';

const FlashSale = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const response = await bookService.getAllBooks({
                    page: 0,
                    size: 10,
                    sortBy: 'sale',
                    sortDirection: 'DESC'
                });
                if (response.result && response.result.content) {
                    setBooks(response.result.content);
                }
            } catch (error) {
                console.error("Failed to fetch super sale books", error);
            }
        };

        fetchBestSellers();
    }, []);

    const handleNext = () => {
        if (currentIndex + itemsPerPage < books.length) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Reset to start if at end, or just stop? 
            // "next sang các sách còn lại" implies navigation. 
            // Let's loop back to 0 for continuous feeling or just stop.
            // User just said "next to other books".
            setCurrentIndex(0);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const visibleBooks = books.slice(currentIndex, currentIndex + itemsPerPage);

    // If fetch returns fewer than 5 books, fill with empty or just show what we have
    // But logic requires 10 books requested.

    const handleBookClick = (bookId: number) => {
        navigate(`/shop/book-detail/${bookId}`);
    };

    if (books.length === 0) return null;

    return (
        <section className="flash-sale">
            <div className="flash-sale__container">
                <div className="flash-sale__header">
                    <div className="flash-sale__title-group">
                        <div className="flash-sale__logo">
                            <Zap size={24} fill="#C92127" color="#C92127" className="flash-sale__zap" />
                            <span className="flash-sale__text">SUPER SALE</span>
                        </div>
                    </div>
                    {/* Optional: Add View All link if there is a page for it */}
                </div>

                <div className="flash-sale__grid">
                    {currentIndex > 0 && (
                        <button className="flash-sale__nav-prev" onClick={handlePrev}>
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {visibleBooks.map((book) => (
                        <div key={book.id} className="flash-sale__card" onClick={() => handleBookClick(book.id)}>
                            <div className="flash-sale__image-wrapper">
                                <img src={book.bookImageUrl} alt={book.name} className="flash-sale__image" />
                            </div>
                            <div className="flash-sale__info">
                                <h3 className="flash-sale__book-name" title={book.name}>{book.name}</h3>
                                <div className="flash-sale__price-row">
                                    <span className="flash-sale__current-price">
                                        {book.finalPrice?.toLocaleString('vi-VN')} đ
                                    </span>
                                    {book.sale > 0 && (
                                        <span className="flash-sale__discount">-{Math.round(book.sale)}%</span>
                                    )}
                                </div>
                                {book.sale > 0 && (
                                    <div className="flash-sale__original-price">
                                        {book.originalCost.toLocaleString('vi-VN')} đ
                                    </div>
                                )}
                                <div className="flash-sale__progress-bar">
                                    <div className="flash-sale__progress-inner" style={{ width: `${Math.min(book.stock, 100)}%` }}></div>
                                    <span className="flash-sale__progress-text">Còn lại {book.stock}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {books.length > itemsPerPage && (
                        <button className="flash-sale__nav-next" onClick={handleNext}>
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FlashSale;
