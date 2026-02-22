import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { setCustomerToken, setCustomerRefreshToken, setCustomerUserId } from '../../../utils/auth';
import authService from '../../../api/authService';
import userService from '../../../api/userService';
import '../../../styles/pages/auth.css';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await authService.login({ email, password });
            if (response.result) {
                setCustomerToken(response.result.accessToken);
                setCustomerRefreshToken(response.result.refreshToken);

                // Fetch and set user ID
                try {
                    const userRes = await userService.getOwnProfile();
                    if (userRes.result) {
                        setCustomerUserId(userRes.result.id);
                    }
                } catch (userErr) {
                    console.error("Failed to fetch user ID after login:", userErr);
                }

                toast.success(t('auth.toast_login_success'));
                navigate('/shop/home');
            }
        } catch (err: any) {
            console.error(err);
            setError(t('auth.error_login'));
            toast.error(t('auth.error_login'));
        }
    };


    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Tabs */}
                <div className="auth-tabs">
                    <Link
                        to="/shop/login"
                        className={`auth-tab-item ${location.pathname === '/shop/login' ? 'active' : ''}`}
                    >
                        {t('auth.login_tab')}
                    </Link>
                    <Link
                        to="/shop/register"
                        className={`auth-tab-item ${location.pathname === '/shop/register' ? 'active' : ''}`}
                    >
                        {t('auth.register_tab')}
                    </Link>
                </div>

                {/* Login Form */}
                <div className="auth-form-content">
                    <form onSubmit={handleSubmit} className="auth-form__form">
                        <div className="form-group">
                            <label className="form-group__label">{t('auth.label_email_phone')}</label>
                            <div className="form-group__input-wrapper">
                                <input
                                    type="email"
                                    className="form-group__input"
                                    placeholder={t('auth.placeholder_email_phone')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-group__label">{t('auth.label_password')}</label>
                            <div className="form-group__input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-group__input"
                                    placeholder={t('auth.placeholder_password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? t('auth.hide_password') : t('auth.show_password')}
                                </button>
                            </div>
                        </div>

                        <Link to="/forgot-password" className="auth-form__forgot-link">
                            {t('auth.forgot_password')}
                        </Link>

                        {error && (
                            <div className="auth-form__error">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn-auth-submit">
                            {t('auth.login_button')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
