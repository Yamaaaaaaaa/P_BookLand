import { useState, useMemo } from 'react';
import { mockShippingMethods } from '../../../data/mockMasterData';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Pagination from '../../../components/admin/Pagination';
import AdminModal, { type FieldConfig } from '../../../components/admin/AdminModal';
import type { ShippingMethod } from '../../../types/ShippingMethod';
import '../../../styles/components/buttons.css';
import '../../../styles/pages/admin-management.css';

const ShippingMethodPage = () => {
    const [methods, setMethods] = useState<ShippingMethod[]>(mockShippingMethods);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
    const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);

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

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this shipping method?')) {
            setMethods(prev => prev.filter(m => m.id !== id));
        }
    };

    const handleEdit = (method: ShippingMethod) => {
        setSelectedMethod(method);
        setModalMode('update');
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedMethod(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleModalSubmit = (formData: any) => {
        if (modalMode === 'create') {
            const newMethod: ShippingMethod = {
                id: Math.max(...methods.map(m => m.id)) + 1,
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description
            };
            setMethods([...methods, newMethod]);
        } else {
            setMethods(methods.map(m => m.id === selectedMethod?.id ? {
                ...m,
                ...formData,
                price: parseFloat(formData.price)
            } : m));
        }
        setIsModalOpen(false);
    };

    const filteredMethods = useMemo(() => {
        let result = methods.filter(method =>
            method.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof ShippingMethod];
                const bValue = b[sortConfig.key as keyof ShippingMethod];

                if (aValue === undefined || bValue === undefined) return 0;

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [methods, searchTerm, sortConfig]);

    const totalPages = Math.ceil(filteredMethods.length / itemsPerPage);
    const paginatedMethods = filteredMethods.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const modalFields: FieldConfig[] = [
        { name: 'name', label: 'Method Name', type: 'text', required: true },
        { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '0' },
        { name: 'description', label: 'Description', type: 'textarea' }
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Shipping Methods</h1>
                    <p className="admin-subtitle">Manage shipping options and fees</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleAdd}
                >
                    <Plus size={18} />
                    Add Method
                </button>
            </div>

            <div className="admin-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search shipping methods..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} className="sortable-header">
                                <div className="th-content">ID {getSortIcon('id')}</div>
                            </th>
                            <th className="sortable-header">
                                <div className="th-content">Name</div>
                            </th>
                            <th className="sortable-header">
                                <div className="th-content">Price</div>
                            </th>
                            <th>Description</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedMethods.map(method => (
                            <tr key={method.id}>
                                <td>#{method.id}</td>
                                <td style={{ fontWeight: 500 }}>{method.name}</td>
                                <td style={{ fontWeight: 600, color: 'var(--shop-accent-primary)' }}>
                                    {formatCurrency(method.price)}
                                </td>
                                <td style={{ color: 'var(--shop-text-secondary)' }}>{method.description}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            title="Edit"
                                            onClick={() => handleEdit(method)}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            title="Delete"
                                            onClick={() => handleDelete(method.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMethods.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--shop-text-muted)' }}>
                        No shipping methods found.
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                mode={modalMode}
                title={modalMode === 'create' ? 'Add Shipping Method' : 'Edit Shipping Method'}
                fields={modalFields}
                initialData={selectedMethod || undefined}
            />
        </div>
    );
};

export default ShippingMethodPage;
