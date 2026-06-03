
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import '../styles/components/flash-sale.css';
import bookService from '../api/bookService';
import type { Book } from '../types/Book';
import { useTranslation } from 'react-i18next';

const FlashSale = ({ itemLimit = 10 }: { itemLimit?: number }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const response = await bookService.getAllBooks({
                    page: 0,
                    size: itemLimit,
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
    }, [itemLimit]);

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

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
                            <span className="flash-sale__text">{t('home.flash_sale.title')}</span>
                        </div>
                    </div>
                    {/* Optional: Add View All link if there is a page for it */}
                </div>

                <div className="flash-sale__grid-wrapper" style={{ position: 'relative' }}>
                    {books.length > 5 && (
                        <button className="flash-sale__nav-prev" onClick={scrollLeft}>
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <div className="flash-sale__grid" ref={scrollRef}>
                    {books.map((book) => (
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
                                    <span className="flash-sale__progress-text">{t('home.flash_sale.stock', { count: book.stock })}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>

                    {books.length > 5 && (
                        <button className="flash-sale__nav-next" onClick={scrollRight}>
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FlashSale;
