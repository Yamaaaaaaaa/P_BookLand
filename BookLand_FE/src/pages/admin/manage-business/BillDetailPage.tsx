import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockBills } from '../../../data/mockOrders';
import { ArrowLeft, Printer, CreditCard, User, MapPin, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import AdminModal, { type FieldConfig } from '../../../components/admin/AdminModal';
import { BillStatus } from '../../../types/Bill';
import '../../../styles/components/buttons.css';

const BillDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const bill = mockBills.find(b => b.id.toString() === id);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([]);

    const getAvailableNextStatuses = (currentStatus: BillStatus): BillStatus[] => {
        switch (currentStatus) {
            case BillStatus.PENDING:
                return [BillStatus.APPROVED, BillStatus.CANCELED];
            case BillStatus.APPROVED:
                return [BillStatus.SHIPPING, BillStatus.CANCELED];
            case BillStatus.SHIPPING:
                return [BillStatus.SHIPPED, BillStatus.CANCELED];
            case BillStatus.SHIPPED:
                return [BillStatus.COMPLETED];
            case BillStatus.COMPLETED:
            case BillStatus.CANCELED:
                return [];
            default:
                return [];
        }
    };

    const handleUpdateStatus = () => {
        const nextStatuses = getAvailableNextStatuses(bill.status);
        if (nextStatuses.length === 0) {
            alert(`Cannot update status from ${bill.status}`);
            return;
        }

        setStatusOptions(nextStatuses.map(status => ({
            value: status,
            label: status
        })));
        setIsModalOpen(true);
    };

    const handleModalSubmit = (formData: any) => {
        // In a real app, this would make an API call
        console.log('Updating status to:', formData.status);

        // Mock update for display
        bill.status = formData.status;
        setIsModalOpen(false);
    };

    const modalFields: FieldConfig[] = [
        {
            name: 'status',
            label: 'New Status',
            type: 'select',
            required: true,
            options: statusOptions
        }
    ];

    if (!bill) {
        return (
            <div className="admin-container">
                <div className="error-state">
                    <h2>Bill not found</h2>
                    <Link to="/admin/manage-business/bills" className="btn-primary">Back to Bills</Link>
                </div>
            </div>
        );
    }

    const createdDate = bill.createdAt ? new Date(bill.createdAt) : new Date();

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/admin/manage-business/bills" className="btn-icon">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="admin-title">Bill #{bill.id}</h1>
                        <p className="admin-subtitle">
                            Created on {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary">
                        <Printer size={18} />
                        Print Invoice
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleUpdateStatus}
                        disabled={getAvailableNextStatuses(bill.status).length === 0}
                        style={{ opacity: getAvailableNextStatuses(bill.status).length === 0 ? 0.5 : 1 }}
                    >
                        <RefreshCw size={18} />
                        Update Status
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                {/* Left Column: Order Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="admin-card" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--shop-border)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Order Items</h3>
                        <table className="admin-table" style={{ marginTop: 0 }}>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.billBooks?.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {item.book.bookImageUrl && (
                                                    <img
                                                        src={item.book.bookImageUrl}
                                                        alt={item.book.name}
                                                        style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{item.book.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--shop-text-muted)' }}>ID: {item.book.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{formatCurrency(item.priceSnapshot)}</td>
                                        <td>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                            {formatCurrency(item.priceSnapshot * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'right', paddingTop: '1rem', color: 'var(--shop-text-secondary)' }}>Subtotal</td>
                                    <td style={{ textAlign: 'right', paddingTop: '1rem', fontWeight: 600 }}>{formatCurrency(bill.totalCost)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'right', paddingTop: '0.5rem', color: 'var(--shop-text-secondary)' }}>Shipping</td>
                                    <td style={{ textAlign: 'right', paddingTop: '0.5rem', fontWeight: 600 }}>{formatCurrency(bill.shippingMethod?.price || 0)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'right', paddingTop: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>Total</td>
                                    <td style={{ textAlign: 'right', paddingTop: '1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--shop-accent-primary)' }}>
                                        {formatCurrency(bill.totalCost + (bill.shippingMethod?.price || 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Right Column: Customer & Order Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Customer Info */}
                    <div className="admin-card" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--shop-border)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={18} />
                            Customer
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                backgroundColor: 'var(--shop-bg-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '1.2rem', color: 'var(--shop-accent-primary)'
                            }}>
                                {bill.user.firstName?.[0]}{bill.user.lastName?.[0]}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{bill.user.firstName} {bill.user.lastName}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--shop-text-muted)' }}>{bill.user.email}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--shop-text-muted)' }}>{bill.user.phone}</div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="admin-card" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--shop-border)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={18} />
                            Shipping
                        </h3>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{bill.shippingMethod?.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--shop-text-muted)', marginBottom: '1rem' }}>
                                Details: {bill.shippingMethod?.description}
                            </div>
                            {bill.user.addresses && bill.user.addresses.length > 0 && (
                                <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    <div>{bill.user.addresses[0].addressDetail}</div>
                                    <div>{bill.user.addresses[0].contactPhone}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="admin-card" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--shop-border)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CreditCard size={18} />
                            Payment
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--shop-text-secondary)' }}>Method:</span>
                            <span style={{ fontWeight: 500 }}>{bill.paymentMethod?.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--shop-text-secondary)' }}>Status:</span>
                            <span style={{
                                fontWeight: 600,
                                color: bill.status === 'COMPLETED' ? '#1e7e34' :
                                    bill.status === 'CANCELED' ? '#d93025' : '#1967d2'
                            }}>{bill.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                mode="update"
                title="Update Bill Status"
                fields={modalFields}
                initialData={{ status: '' }}
            />
        </div>
    );
};

export default BillDetailPage;
