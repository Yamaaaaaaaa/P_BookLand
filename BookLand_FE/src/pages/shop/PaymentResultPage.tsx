import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import paymentApi from '../../api/paymentApi';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Get all params from URL
                const params = searchParams.toString();
                const response = await paymentApi.getPaymentInfo(params);

                if (response.result.status === 'OK') {
                    setStatus('success');
                    setMessage('Thanh toán thành công!');
                } else {
                    setStatus('failed');
                    setMessage('Thanh toán thất bại hoặc bị hủy.');
                }
            } catch (error) {
                console.error("Payment verification failed", error);
                setStatus('failed');
                setMessage('Có lỗi xảy ra khi xác minh thanh toán.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="payment-result-page" style={{ padding: '60px 0', minHeight: '80vh', backgroundColor: '#f0f0f0' }}>
            <div className="shop-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Breadcrumb
                    items={[
                        { label: 'Trang chủ', link: '/shop/home' },
                        { label: 'Kết quả thanh toán' }
                    ]}
                />
                <div className="result-card" style={{ background: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>

                    {status === 'loading' && (
                        <div>
                            <h2>Đang xác minh thanh toán...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="status-icon" style={{ marginBottom: '20px' }}>
                                <CheckCircle size={80} color="#28a745" />
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px', color: '#28a745' }}>THANH TOÁN THÀNH CÔNG</h1>
                            <p style={{ color: '#666', marginBottom: '30px' }}>{message}</p>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="status-icon" style={{ marginBottom: '20px' }}>
                                <XCircle size={80} color="#dc3545" />
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px', color: '#dc3545' }}>THANH TOÁN THẤT BẠI</h1>
                            <p style={{ color: '#666', marginBottom: '30px' }}>{message}</p>
                        </>
                    )}

                    <div className="actions" style={{ marginTop: '30px' }}>
                        <button
                            onClick={() => navigate('/shop/home')}
                            style={{
                                padding: '10px 20px',
                                background: '#333',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;
