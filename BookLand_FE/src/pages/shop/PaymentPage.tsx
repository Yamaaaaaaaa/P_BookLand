import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';

const PaymentPage = () => {
    const { billId } = useParams<{ billId: string }>();
    const navigate = useNavigate();

    return (
        <div className="payment-page" style={{ padding: '60px 0', minHeight: '80vh', backgroundColor: '#f0f0f0' }}>
            <div className="shop-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="payment-card" style={{ background: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div className="status-icon" style={{ marginBottom: '20px' }}>
                        <CheckCircle size={80} color="#28a745" />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>ĐANG CHỜ THANH TOÁN</h1>
                    <p style={{ color: '#666', marginBottom: '30px' }}>
                        Đơn hàng <strong>#{billId}</strong> của bạn đã được tạo thành công và đang chờ xử lý thanh toán.
                    </p>

                    <div className="payment-notice" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '4px', marginBottom: '30px', textAlign: 'left' }}>
                        <p style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#333' }}>
                            <strong>Lưu ý:</strong> Trang này hiện đang là bản thử nghiệm (Placeholder).
                            Chức năng tích hợp thanh toán (VNPAY, MoMo, etc.) sẽ được cập nhật trong tương lai.
                        </p>
                    </div>

                    <div className="payment-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => navigate('/shop/profile')}
                            style={{
                                width: '100%',
                                height: '48px',
                                background: '#C92127',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            XEM LỊCH SỬ ĐƠN HÀNG
                        </button>
                        <button
                            onClick={() => navigate('/shop/home')}
                            style={{
                                width: '100%',
                                height: '48px',
                                background: 'white',
                                color: '#666',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <ShoppingBag size={18} />
                            TIẾP TỤC MUA SẮM
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
