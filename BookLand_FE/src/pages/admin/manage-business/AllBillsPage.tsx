import { mockBills } from '../../../data/mockOrders';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';

const AllBillsPage = () => {
    return (
        <div className="admin-page">
            <h1 className="admin-page__title">All Bills</h1>
            <div className="admin-table-container">
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '12px' }}>ID</th>
                            <th style={{ padding: '12px' }}>Customer</th>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Total</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Method</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockBills.map(bill => (
                            <tr key={bill.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>#{bill.id}</td>
                                <td style={{ padding: '12px' }}>{bill.user.username}</td>
                                <td style={{ padding: '12px' }}>{/* bill.createdAt */} -</td>
                                <td style={{ padding: '12px' }}>{formatCurrency(bill.totalCost)}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: '#e8f0fe',
                                        color: '#1967d2'
                                    }}>
                                        {bill.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>{bill.paymentMethod.name}</td>
                                <td style={{ padding: '12px' }}>
                                    <Link to={`/admin/manage-business/bills/${bill.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllBillsPage;
