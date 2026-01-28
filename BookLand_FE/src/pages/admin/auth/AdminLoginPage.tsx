import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import { mockAdminLogin } from '../../../utils/auth';
import '../../../styles/shop.css';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await mockAdminLogin(email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div className="auth-page auth-page--admin">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding auth-branding--admin">
                    <div className="auth-branding__content">
                        <Shield size={48} className="auth-branding__icon" />
                        <h1 className="auth-branding__title">BookLand Admin Portal</h1>
                        <p className="auth-branding__description">
                            Secure access to the administrative dashboard. Manage your bookstore with ease.
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="auth-form-wrapper">
                    <div className="auth-form">
                        <h2 className="auth-form__title">Admin Sign In</h2>
                        <p className="auth-form__subtitle">Enter your admin credentials to continue</p>

                        <form onSubmit={handleSubmit} className="auth-form__form">
                            <div className="form-group">
                                <label className="form-group__label">
                                    <Mail size={18} />
                                    Admin Email
                                </label>
                                <input
                                    type="email"
                                    className="form-group__input"
                                    placeholder="Enter your admin email"
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
                                Sign In to Dashboard
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="auth-form__footer">
                            <p className="auth-form__notice">
                                <Shield size={14} />
                                This is a secure admin area
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
