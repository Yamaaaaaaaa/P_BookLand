import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/shop.css';
import { heroBook } from '../data/mockBooks';

const HeroSection = () => {
    return (
        <section className="hero">
            <div className="shop-container">
                <div className="hero__inner">
                    <div className="hero__content">
                        <span className="hero__subtitle">Best Seller</span>
                        <h1 className="hero__title">
                            {heroBook.title.split(' ').slice(0, -2).join(' ')}{' '}
                            <span className="hero__title-accent">
                                {heroBook.title.split(' ').slice(-2).join(' ')}
                            </span>
                        </h1>
                        <p className="hero__description">
                            {heroBook.description}
                        </p>
                        <Link to="/shop/books" className="hero__cta">
                            Read More
                            <ArrowRight size={18} className="hero__cta-arrow" />
                        </Link>
                    </div>

                    <div className="hero__visual">
                        <div className="hero__book-display">
                            <img
                                src={heroBook.image}
                                alt={heroBook.title}
                                className="hero__book-cover"
                            />
                            <div className="hero__nav-arrows">
                                <button className="hero__nav-btn" aria-label="Previous">
                                    <ChevronLeft size={20} />
                                </button>
                                <button className="hero__nav-btn" aria-label="Next">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <div className="hero__dots">
                                <span className="hero__dot hero__dot--active"></span>
                                <span className="hero__dot"></span>
                                <span className="hero__dot"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
