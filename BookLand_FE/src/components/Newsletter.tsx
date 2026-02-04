import { useState } from 'react';
import '../styles/components/newsletter.css';

const Newsletter = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Subscribing email:', email);
        setEmail('');
    };

    return (
        <section className="newsletter-section">
            <div className="newsletter-container">
                <div className="newsletter-inner">
                    <div className="newsletter-content">
                        <h2 className="newsletter-title">
                            Đăng ký nhận bản tin của chúng tôi
                        </h2>
                        <p className="newsletter-description">
                            Hãy để lại email của bạn để không bỏ lỡ những thông tin mới nhất về sách mới, sự kiện và các chương trình ưu đãi hấp dẫn từ BookLand.
                        </p>
                        <form className="newsletter-form-group" onSubmit={handleSubmit}>
                            <input
                                type="email"
                                className="newsletter-email-input"
                                placeholder="Nhập địa chỉ email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="newsletter-submit-btn">
                                Đăng ký ngay
                            </button>
                        </form>
                    </div>
                    <div className="newsletter-image-box">
                        <img
                            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop"
                            alt="Reading books"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
