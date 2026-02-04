import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../../../api/authService';
import '../../../styles/pages/auth.css';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        try {
            await authService.register({
                username,
                email,
                password
            });
            navigate('/shop/login');
        } catch (err) {
            console.error(err);
            setError('Đăng ký thất bại. Vui lòng thử lại.');
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

                {/* Register Form */}
                <div className="auth-form-content">
                    <form onSubmit={handleSubmit} className="auth-form__form">
                        <div className="form-group">
                            <label className="form-group__label">Tên đăng nhập</label>
                            <div className="form-group__input-wrapper">
                                <input
                                    type="text"
                                    className="form-group__input"
                                    placeholder="Nhập tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-group__label">Email Address</label>
                            <div className="form-group__input-wrapper">
                                <input
                                    type="email"
                                    className="form-group__input"
                                    placeholder="Nhập địa chỉ email"
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

                        <div className="form-group">
                            <label className="form-group__label">Xác nhận mật khẩu</label>
                            <div className="form-group__input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="form-group__input"
                                    placeholder="Xác nhận mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn-toggle-password"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="auth-form__error">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn-auth-submit">
                            Đăng ký
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
