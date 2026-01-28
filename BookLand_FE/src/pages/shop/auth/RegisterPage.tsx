import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, BookOpen, ArrowRight, User } from 'lucide-react';
import { mockCustomerLogin } from '../../../utils/auth';
import '../../../styles/shop.css';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Mock registration - in real app, call registration API first
            await mockCustomerLogin(email, password);
            navigate('/shop/home');
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <div className="auth-branding__content">
                        <BookOpen size={48} className="auth-branding__icon" />
                        <h1 className="auth-branding__title">Join BookLand Today</h1>
                        <p className="auth-branding__description">
                            Create your account and start exploring thousands of amazing books.
                        </p>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="auth-form-wrapper">
                    <div className="auth-form">
                        <h2 className="auth-form__title">Create Account</h2>
                        <p className="auth-form__subtitle">Fill in your details to get started</p>

                        <form onSubmit={handleSubmit} className="auth-form__form">
                            <div className="form-group">
                                <label className="form-group__label">
                                    <User size={18} />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    className="form-group__input"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-group__label">
                                    <Lock size={18} />
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    className="form-group__input"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="auth-form__error">
                                    {error}
                                </div>
                            )}

                            <button type="submit" className="btn-primary btn-primary--large btn-primary--full">
                                Create Account
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="auth-form__footer">
                            <p>
                                Already have an account?{' '}
                                <Link to="/shop/login" className="auth-form__link">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
