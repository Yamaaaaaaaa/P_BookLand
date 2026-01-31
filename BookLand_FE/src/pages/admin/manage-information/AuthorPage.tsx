import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Author } from '../../../types/Author';
import authorService from '../../../api/authorService';
import AdminModal, { type FieldConfig } from '../../../components/admin/AdminModal';
import Pagination from '../../../components/admin/Pagination';
import '../../../styles/components/buttons.css';
import '../../../styles/components/forms.css';
import '../../../styles/pages/admin-management.css';
import { toast } from 'react-toastify';

const AuthorPage = () => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Server-side Pagination & Sort State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Author; direction: 'asc' | 'desc' } | null>({ key: 'id', direction: 'asc' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update' | 'view'>('create');
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

    const fetchAuthors = async () => {
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

            const response = await authorService.getAllAuthors(params);
            if (response.result) {
                if (response.result.content && typeof response.result.totalPages === 'number') {
                    setAuthors(response.result.content);
                    setTotalPages(response.result.totalPages);
                } else if (Array.isArray(response.result)) {
                    setAuthors(response.result);
                    setTotalPages(1);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load authors");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAuthors();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, sortConfig, searchTerm]);

    const fieldConfig: FieldConfig[] = [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Author Name' },
        { name: 'authorImage', label: 'Author Image URL', type: 'text', placeholder: 'https://...' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'About the author...' }
    ];

    const handleSort = (key: keyof Author) => {
        setSortConfig(current => {
            let direction: 'asc' | 'desc' = 'asc';
            if (current && current.key === key && current.direction === 'asc') {
                direction = 'desc';
            }
            return { key, direction };
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const openModal = (mode: 'create' | 'update' | 'view', author?: Author) => {
        setModalMode(mode);
        setSelectedAuthor(author || null);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (data: any) => {
        try {
            if (modalMode === 'update' && selectedAuthor) {
                await authorService.updateAuthor(selectedAuthor.id, data);
                toast.success("Author updated successfully");
            } else if (modalMode === 'create') {
                await authorService.createAuthor(data);
                toast.success("Author created successfully");
            }
            fetchAuthors();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this author?')) {
            try {
                await authorService.deleteAuthor(id);
                toast.success("Author deleted successfully");
                fetchAuthors();
            } catch (error) {
                console.error(error);
                toast.error("Delete failed");
            }
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
                    <p className="admin-subtitle">Manage book authors</p>
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
                        onChange={handleSearchChange}
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
                        {authors.map(author => (
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
                                <td style={{ color: 'var(--shop-text-muted)' }}>{author.description ? (author.description.length > 50 ? author.description.substring(0, 50) + '...' : author.description) : '-'}</td>
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
                        {authors.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No authors found.
                                </td>
                            </tr>
                        )}
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
