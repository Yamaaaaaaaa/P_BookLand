import { useState, useMemo } from 'react';
import { mockBills } from '../../../data/mockOrders';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';
import { Search, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Pagination from '../../../components/admin/Pagination';
import MultiSelect from '../../../components/admin/MultiSelect';
import { BillStatus } from '../../../types/Bill';
import { mockPaymentMethods } from '../../../data/mockMasterData';
import '../../../styles/components/buttons.css';
import '../../../styles/pages/admin-management.css';

const AllBillsPage = () => {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<(string | number)[]>([]);
    const [selectedPayments, setSelectedPayments] = useState<(string | number)[]>([]);

    // Sort State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Options
    const statusOptions = Object.values(BillStatus).map(status => ({ value: status, label: status }));
    const paymentOptions = mockPaymentMethods.map(pm => ({ value: pm.name, label: pm.name })); // Filter by name as ID might not be intuitive or display name is better

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="sort-icon inactive" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    // Filter & Sort Logic
    const filteredBills = useMemo(() => {
        let result = mockBills.filter(bill => {
            // Search
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                bill.id.toString().includes(searchLower) ||
                (bill.user.firstName + ' ' + bill.user.lastName).toLowerCase().includes(searchLower) ||
                bill.user.username.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            // Status Filter
            if (selectedStatuses.length > 0) {
                if (!selectedStatuses.includes(bill.status)) return false;
            }

            // Payment Filter
            if (selectedPayments.length > 0) {
                if (!selectedPayments.includes(bill.paymentMethod.name)) return false;
            }

            return true;
        });

        // Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof typeof a];
                let bValue: any = b[sortConfig.key as keyof typeof b];

                if (sortConfig.key === 'user' || sortConfig.key === 'paymentMethod') {
                    // Sorting for these disabled by request
                    return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [searchTerm, selectedStatuses, selectedPayments, sortConfig]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const paginatedBills = useMemo(() => {
        return filteredBills.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredBills, currentPage, itemsPerPage]);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Orders & Bills</h1>
                    <p className="admin-subtitle">Manage customer orders</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="admin-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <MultiSelect
                            label="Status"
                            options={statusOptions}
                            value={selectedStatuses}
                            onChange={setSelectedStatuses}
                            placeholder="Filter by Status"
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <MultiSelect
                            label="Payment Method"
                            options={paymentOptions}
                            value={selectedPayments}
                            onChange={setSelectedPayments}
                            placeholder="Filter by Payment"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedStatuses([]);
                            setSelectedPayments([]);
                            setSortConfig(null);
                        }}
                        className="btn-secondary"
                        style={{ height: '42px', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} className="sortable-header">
                                <div className="th-content">Bill ID {getSortIcon('id')}</div>
                            </th>
                            <th className="sortable-header">
                                <div className="th-content">Customer</div>
                            </th>
                            <th onClick={() => handleSort('createdAt')} className="sortable-header">
                                <div className="th-content">Date {getSortIcon('createdAt')}</div>
                            </th>
                            <th onClick={() => handleSort('totalCost')} className="sortable-header">
                                <div className="th-content">Total {getSortIcon('totalCost')}</div>
                            </th>
                            <th className="sortable-header">
                                <div className="th-content">Status</div>
                            </th>
                            <th className="sortable-header">
                                <div className="th-content">Payment Method</div>
                            </th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBills.map(bill => (
                            <tr key={bill.id}>
                                <td>#{bill.id}</td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{bill.user.username}</div>
                                </td>
                                <td style={{ color: 'var(--shop-text-muted)' }}>
                                    {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : '-'}
                                </td>
                                <td style={{ fontWeight: 600 }}>{formatCurrency(bill.totalCost)}</td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        backgroundColor: bill.status === 'COMPLETED' ? '#e6f4ea' :
                                            bill.status === 'CANCELED' ? '#fce8e6' : '#e8f0fe',
                                        color: bill.status === 'COMPLETED' ? '#1e7e34' :
                                            bill.status === 'CANCELED' ? '#d93025' : '#1967d2'
                                    }}>
                                        {bill.status}
                                    </span>
                                </td>
                                <td>{bill.paymentMethod?.name || '-'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <Link to={`/admin/manage-business/bill-detail/${bill.id}`} className="btn-icon" title="View Details">
                                            <Eye size={18} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredBills.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--shop-text-muted)' }}>
                        No bills found matching your filters.
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default AllBillsPage;
