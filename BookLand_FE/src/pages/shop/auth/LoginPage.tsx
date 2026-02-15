import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { setCustomerToken, setCustomerRefreshToken, setCustomerUserId } from '../../../utils/auth';
import authService from '../../../api/authService';
import userService from '../../../api/userService';
import '../../../styles/pages/auth.css';

const LoginPage = () => {
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

                navigate('/shop/home');
            }
        } catch (err: any) {
            console.error(err);
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
                        Đăng nhập
                    </Link>
                    <Link
                        to="/shop/register"
                        className={`auth-tab-item ${location.pathname === '/shop/register' ? 'active' : ''}`}
                    >
                        Đăng ký
                    </Link>
                </div>

                {/* Login Form */}
                <div className="auth-form-content">
                    <form onSubmit={handleSubmit} className="auth-form__form">
                        <div className="form-group">
                            <label className="form-group__label">Số điện thoại/Email</label>
                            <div className="form-group__input-wrapper">
                                <input
                                    type="email"
                                    className="form-group__input"
                                    placeholder="Nhập số điện thoại hoặc email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-group__label">Mật khẩu</label>
                            <div className="form-group__input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-group__input"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Ẩn' : 'Hiện'}
                                </button>
                            </div>
                        </div>

                        <Link to="/forgot-password" className="auth-form__forgot-link">
                            Quên mật khẩu?
                        </Link>

                        {error && (
                            <div className="auth-form__error">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn-auth-submit">
                            Đăng nhập
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
