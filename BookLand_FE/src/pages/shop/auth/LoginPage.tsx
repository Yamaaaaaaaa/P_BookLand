import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, BookOpen, ArrowRight } from 'lucide-react';
import { mockCustomerLogin } from '../../../utils/auth';
import '../../../styles/pages/auth.css';
import '../../../styles/components/forms.css';
import '../../../styles/components/buttons.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await mockCustomerLogin(email, password);
            navigate('/shop/home');
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <div className="auth-branding__content">
                        <BookOpen size={48} className="auth-branding__icon" />
                        <h1 className="auth-branding__title">Welcome Back to BookLand</h1>
                        <p className="auth-branding__description">
                            Discover your next favorite book. Sign in to continue your reading journey.
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="auth-form-wrapper">
                    <div className="auth-form">
                        <h2 className="auth-form__title">Sign In</h2>
                        <p className="auth-form__subtitle">Enter your credentials to access your account</p>

                        <form onSubmit={handleSubmit} className="auth-form__form">
                            <div className="form-group">
                                <label className="form-group__label">
                                    <Mail size={18} />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="form-group__input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-group__label">
                                    <Lock size={18} />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="form-group__input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="auth-form__error">
                                    {error}
                                </div>
                            )}

                            <button type="submit" className="btn-primary btn-primary--large btn-primary--full">
                                Sign In
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="auth-form__footer">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/shop/register" className="auth-form__link">
                                    Create one now
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
