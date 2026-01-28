import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockCustomerLogin } from '../../../utils/auth';

const RegisterPage = () => {
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
        <div>
            <h1>Customer Registration</h1>
            <form onSubmit={handleSubmit}>
                <div>
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
                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}

                        required
                    />
                </div>
                {error && <p>{error}</p>}
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/shop/login">Login here</Link>
            </p>
        </div>
    );
};

export default RegisterPage;
