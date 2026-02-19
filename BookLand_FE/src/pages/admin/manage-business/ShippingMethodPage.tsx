import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Pagination from '../../../components/admin/Pagination';
import AdminModal, { type FieldConfig } from '../../../components/admin/AdminModal';
import type { ShippingMethod } from '../../../types/ShippingMethod';
import shippingMethodService from '../../../api/shippingMethodService';
import '../../../styles/components/buttons.css';
import '../../../styles/pages/admin-management.css';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const ShippingMethodPage = () => {
    const { t } = useTranslation();
    const [methods, setMethods] = useState<ShippingMethod[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Server-side Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(5);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
    const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);

    const fetchShippingMethods = async () => {
        try {
            const params: any = {
                page: currentPage - 1,
                size: itemsPerPage,
                keyword: searchTerm || undefined
            };

            if (sortConfig) {
                params.sortBy = sortConfig.key;
                params.sortDirection = sortConfig.direction.toUpperCase();
            }

            const response = await shippingMethodService.getAllShippingMethods(params);
            if (response.result) {
                if (response.result.content && typeof response.result.totalPages === 'number') {
                    setMethods(response.result.content);
                    setTotalPages(response.result.totalPages);
                } else if (Array.isArray(response.result)) {
                    setMethods(response.result);
                    setTotalPages(1);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(t('admin.shipping_method.load_fail'));
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchShippingMethods();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, sortConfig, searchTerm]);

    const handleSort = (key: string) => {
        setSortConfig(current => {
            let direction: 'asc' | 'desc' = 'asc';
            if (current && current.key === key && current.direction === 'asc') {
                direction = 'desc';
            }
            return { key, direction };
        });
    };

    const getSortIcon = (key: string) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="sort-icon inactive" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    const handleDelete = async (id: number) => {
        if (window.confirm(t('admin.shipping_method.confirm_delete'))) {
            try {
                await shippingMethodService.deleteShippingMethod(id);
                toast.success(t('admin.shipping_method.delete_success'));
                fetchShippingMethods();
            } catch (error) {
                console.error(error);
                toast.error(t('admin.shipping_method.delete_fail'));
            }
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleModalSubmit = async (formData: any) => {
        try {
            const dataToSubmit = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (modalMode === 'create') {
                await shippingMethodService.createShippingMethod(dataToSubmit);
                toast.success(t('admin.shipping_method.create_success'));
            } else {
                if (selectedMethod) {
                    await shippingMethodService.updateShippingMethod(selectedMethod.id, dataToSubmit);
                    toast.success(t('admin.shipping_method.update_success'));
                }
            }
            fetchShippingMethods();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(modalMode === 'create' ? t('admin.shipping_method.create_fail') : t('admin.shipping_method.update_fail'));
        }
    };

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
                        onChange={handleSearchChange}
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
                        {methods.map(method => (
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
                {methods.length === 0 && (
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
