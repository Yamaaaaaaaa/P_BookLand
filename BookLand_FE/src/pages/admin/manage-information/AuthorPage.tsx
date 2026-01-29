import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { mockAuthors } from '../../../data/mockMasterData';
import type { Author } from '../../../types/Author';
import AdminModal, { type FieldConfig } from '../../../components/admin/AdminModal';
import Pagination from '../../../components/admin/Pagination';
import '../../../styles/components/buttons.css';
import '../../../styles/components/forms.css';
import '../../../styles/pages/admin-management.css';

const AuthorPage = () => {
    const [authors, setAuthors] = useState<Author[]>(mockAuthors);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update' | 'view'>('create');
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Author; direction: 'asc' | 'desc' } | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fieldConfig: FieldConfig[] = [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Author Name' },
        { name: 'authorImage', label: 'Author Image URL', type: 'image', placeholder: 'https://...' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'About the author...' }
    ];

    const handleSort = (key: keyof Author) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const filteredAuthors = authors
        .filter(author =>
            author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (author.description && author.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
    const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
    const paginatedAuthors = filteredAuthors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    const openModal = (mode: 'create' | 'update' | 'view', author?: Author) => {
        setModalMode(mode);
        setSelectedAuthor(author || null);
        setIsModalOpen(true);
    };

    const handleModalSubmit = (data: any) => {
        if (modalMode === 'update' && selectedAuthor) {
            setAuthors(prev => prev.map(a =>
                a.id === selectedAuthor.id ? { ...a, ...data } : a
            ));
        } else if (modalMode === 'create') {
            const newId = Math.max(...authors.map(a => a.id)) + 1;
            setAuthors(prev => [...prev, { id: newId, ...data }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this author?')) {
            setAuthors(prev => prev.filter(a => a.id !== id));
        }
    };

    const getSortIcon = (key: keyof Author) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="sort-icon inactive" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Author Management</h1>
                    <p className="admin-subtitle">Manage authors in the catalog</p>
                </div>
                <button className="btn-primary" onClick={() => openModal('create')}>
                    <Plus size={20} />
                    Add Author
                </button>
            </div>

            <div className="admin-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search authors by name or description..."
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
                            <th>Image</th>
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
                        {paginatedAuthors.map(author => (
                            <tr key={author.id}>
                                <td>#{author.id}</td>
                                <td>
                                    {author.authorImage ? (
                                        <img src={author.authorImage} alt={author.name} className="info-image" />
                                    ) : (
                                        <div className="info-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{author.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </td>
                                <td style={{ fontWeight: 500 }}>{author.name}</td>
                                <td style={{ color: 'var(--shop-text-muted)' }}>{author.description || '-'}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="action-buttons">
                                        <button className="btn-icon" onClick={() => openModal('view', author)}>
                                            <Eye size={18} />
                                        </button>
                                        <button className="btn-icon" onClick={() => openModal('update', author)}>
                                            <Edit size={18} />
                                        </button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(author.id)}>
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
                title={`${modalMode.charAt(0).toUpperCase() + modalMode.slice(1)} Author`}
                fields={fieldConfig}
                initialData={selectedAuthor}
            />
        </div>
    );
};

export default AuthorPage;
