import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockCustomerLogin } from '../../../utils/auth';

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
        <div>
            <h1>Customer Login</h1>
            <form onSubmit={handleSubmit}>
                <div >
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}

                        required
                    />
                </div>
                {error && <p>{error}</p>}
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/shop/register">Register here</Link>
            </p>
        </div>
    );
};

export default LoginPage;
