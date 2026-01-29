import { useState } from 'react';
import '../styles/pages/home.css';
import '../styles/components/buttons.css';

const Newsletter = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter subscription
        console.log('Subscribing email:', email);
        setEmail('');
    };

    return (
        <section className="newsletter">
            <div className="shop-container">
                <div className="newsletter__inner">
                    <div className="newsletter__content">
                        <h2 className="newsletter__title">
                            Subscribe To Our Newsletter
                        </h2>
                        <p className="newsletter__description">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Sed eu feugiat amet, libero ipsum enim pharetra hac.
                        </p>
                        <form className="newsletter__form" onSubmit={handleSubmit}>
                            <input
                                type="email"
                                className="newsletter__input"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="newsletter__submit">
                                Subscribe
                            </button>
                        </form>
                    </div>
                    <div className="newsletter__image">
                        <img
                            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop"
                            alt="Reading books"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
