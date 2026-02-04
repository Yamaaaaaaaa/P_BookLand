import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap } from 'lucide-react';
import '../styles/components/flash-sale.css';
import { featuredBooks } from '../data/mockBooks';

const FlashSale = () => {
    const [timeLeft, setTimeLeft] = useState({
        hours: 2,
        minutes: 46,
        seconds: 22
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) {
                    seconds--;
                } else {
                    if (minutes > 0) {
                        minutes--;
                        seconds = 59;
                    } else {
                        if (hours > 0) {
                            hours--;
                            minutes = 59;
                            seconds = 59;
                        }
                    }
                }
                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    // Use a subset of books for flash sale
    const flashSaleBooks = featuredBooks.slice(0, 5);

    return (
        <section className="flash-sale">
            <div className="flash-sale__container">
                <div className="flash-sale__header">
                    <div className="flash-sale__title-group">
                        <div className="flash-sale__logo">
                            <Zap size={24} fill="#C92127" color="#C92127" className="flash-sale__zap" />
                            <span className="flash-sale__text">FLASH SALE</span>
                        </div>
                        <div className="flash-sale__countdown">
                            <span className="flash-sale__countdown-label">Bắt đầu trong</span>
                            <div className="flash-sale__timer">
                                <span className="flash-sale__time-box">{formatNumber(timeLeft.hours)}</span>
                                <span className="flash-sale__time-sep">:</span>
                                <span className="flash-sale__time-box">{formatNumber(timeLeft.minutes)}</span>
                                <span className="flash-sale__time-sep">:</span>
                                <span className="flash-sale__time-box">{formatNumber(timeLeft.seconds)}</span>
                            </div>
                        </div>
                    </div>
                    <Link to="/flash-sale" className="flash-sale__view-all">
                        Xem tất cả <ChevronRight size={18} />
                    </Link>
                </div>

                <div className="flash-sale__grid">
                    {flashSaleBooks.map((book) => (
                        <div key={book.id} className="flash-sale__card">
                            <div className="flash-sale__image-wrapper">
                                <img src={book.bookImageUrl} alt={book.name} className="flash-sale__image" />
                            </div>
                            <div className="flash-sale__info">
                                <h3 className="flash-sale__book-name">{book.name}</h3>
                                <div className="flash-sale__price-row">
                                    <span className="flash-sale__current-price">
                                        {book.finalPrice.toLocaleString('vi-VN')} đ
                                    </span>
                                    <span className="flash-sale__discount">-{Math.round(book.sale * 100)}%</span>
                                </div>
                                <div className="flash-sale__original-price">
                                    {book.originalCost.toLocaleString('vi-VN')} đ
                                </div>
                                <div className="flash-sale__progress-bar">
                                    <div className="flash-sale__progress-inner" style={{ width: '10%' }}></div>
                                    <span className="flash-sale__progress-text">Đã bán 0</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Navigation Arrow */}
                    <button className="flash-sale__nav-next">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FlashSale;
