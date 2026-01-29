import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { mockCategories } from '../../../data/mockMasterData';
import type { Category } from '../../../types/Category';
import AdminModal, { type FieldConfig } from '../../../components/admin/AdminModal';
import Pagination from '../../../components/admin/Pagination';
import '../../../styles/components/buttons.css';
import '../../../styles/components/forms.css';
import '../../../styles/pages/admin-management.css';

const CategoryPage = () => {
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update' | 'view'>('create');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Category; direction: 'asc' | 'desc' } | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fieldConfig: FieldConfig[] = [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Category Name' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description...' }
    ];

    const handleSort = (key: keyof Category) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const filteredCategories = categories
        .filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;

            const aValue = a[key] ?? '';
            const bValue = b[key] ?? '';

            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    // Pagination Logic
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    const openModal = (mode: 'create' | 'update' | 'view', category?: Category) => {
        setModalMode(mode);
        setSelectedCategory(category || null);
        setIsModalOpen(true);
    };

    const handleModalSubmit = (data: any) => {
        if (modalMode === 'update' && selectedCategory) {
            setCategories(prev => prev.map(c =>
                c.id === selectedCategory.id ? { ...c, ...data } : c
            ));
        } else if (modalMode === 'create') {
            const newId = Math.max(...categories.map(c => c.id)) + 1;
            setCategories(prev => [...prev, { id: newId, ...data }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    const getSortIcon = (key: keyof Category) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="sort-icon inactive" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Category Management</h1>
                    <p className="admin-subtitle">Manage book categories</p>
                </div>
                <button className="btn-primary" onClick={() => openModal('create')}>
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="admin-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search categories by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-table-container margin-top">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} className="sortable-header" style={{ width: '80px' }}>
                                <div className="th-content">
                                    ID
                                    {getSortIcon('id')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('name')} className="sortable-header">
                                <div className="th-content">
                                    Name
                                    {getSortIcon('name')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('description')} className="sortable-header">
                                <div className="th-content">
                                    Description
                                    {getSortIcon('description')}
                                </div>
                            </th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCategories.map(category => (
                            <tr key={category.id}>
                                <td>#{category.id}</td>
                                <td style={{ fontWeight: 500 }}>{category.name}</td>
                                <td style={{ color: 'var(--shop-text-muted)' }}>{category.description || '-'}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="action-buttons">
                                        <button className="btn-icon" onClick={() => openModal('view', category)}>
                                            <Eye size={18} />
                                        </button>
                                        <button className="btn-icon" onClick={() => openModal('update', category)}>
                                            <Edit size={18} />
                                        </button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(category.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                mode={modalMode}
                title={`${modalMode.charAt(0).toUpperCase() + modalMode.slice(1)} Category`}
                fields={fieldConfig}
                initialData={selectedCategory}
            />
        </div>
    );
};

export default CategoryPage;
