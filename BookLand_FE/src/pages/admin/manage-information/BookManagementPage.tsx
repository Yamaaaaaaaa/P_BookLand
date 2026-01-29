import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { mockBooks } from '../../../data/mockBooks';
import { mockCategories, mockAuthors, mockSeries } from '../../../data/mockMasterData';
import { formatCurrency } from '../../../utils/formatters';
import type { Book } from '../../../types/Book';
import MultiSelect from '../../../components/admin/MultiSelect';
import Pagination from '../../../components/admin/Pagination';
import '../../../styles/components/buttons.css';
import '../../../styles/pages/admin-management.css';

const BookManagementPage = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>(mockBooks);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter States
    const [selectedCategories, setSelectedCategories] = useState<(string | number)[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<(string | number)[]>([]);
    const [selectedSeries, setSelectedSeries] = useState<(string | number)[]>([]);
    const [pinFilter, setPinFilter] = useState<'all' | 'pinned' | 'unpinned'>('all');

    // Sort State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Determine options for filters
    const categoryOptions = mockCategories.map(c => ({ value: c.id, label: c.name }));
    const authorOptions = mockAuthors.map(a => ({ value: a.id, label: a.name }));
    const seriesOptions = mockSeries.map(s => ({ value: s.id, label: s.name }));

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getSortIcon = (key: string) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="sort-icon inactive" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    const filteredBooks = useMemo(() => {
        let result = books.filter(book => {
            // Text Search
            const matchesSearch =
                book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.name.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // Category Filter
            if (selectedCategories.length > 0) {
                const bookCategoryIds = book.categories?.map(c => c.id) || [];
                const hasMatchingCategory = selectedCategories.some(id => bookCategoryIds.includes(Number(id)));
                if (!hasMatchingCategory) return false;
            }

            // Author Filter
            if (selectedAuthors.length > 0) {
                const isMatchingAuthor = selectedAuthors.includes(book.author.id);
                if (!isMatchingAuthor) return false;
            }

            // Series Filter
            if (selectedSeries.length > 0) {
                if (!book.series) return false;
                if (!selectedSeries.includes(book.series.id)) return false;
            }

            // PIN Filter
            if (pinFilter === 'pinned' && !book.pin) return false;
            if (pinFilter === 'unpinned' && book.pin) return false;

            return true;
        });

        // Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Book];
                let bValue: any = b[sortConfig.key as keyof Book];

                // Check for nested properties or strict keys
                switch (sortConfig.key) {
                    case 'author':
                        aValue = a.author.name;
                        bValue = b.author.name;
                        break;
                    case 'series':
                        aValue = a.series?.name || '';
                        bValue = b.series?.name || '';
                        break;
                    case 'price': // Calculated price
                        aValue = a.originalCost * (1 - (a.sale || 0) / 100);
                        bValue = b.originalCost * (1 - (b.sale || 0) / 100);
                        break;
                    // Default cases handled above
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [books, searchTerm, selectedCategories, selectedAuthors, selectedSeries, pinFilter, sortConfig]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const paginatedBooks = useMemo(() => {
        return filteredBooks.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredBooks, currentPage, itemsPerPage]);

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            setBooks(prev => prev.filter(book => book.id !== id));
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Book Management</h1>
                    <p className="admin-subtitle">Manage your book catalog</p>
                </div>
                <Link to="/admin/manage-information/book-detail/new" className="btn-primary">
                    <Plus size={20} />
                    Add New Book
                </Link>
            </div>

            {/* Filters */}
            <div className="admin-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search books by name or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <MultiSelect
                            label="Categories"
                            options={categoryOptions}
                            value={selectedCategories}
                            onChange={setSelectedCategories}
                            placeholder="Filter by Category"
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <MultiSelect
                            label="Authors"
                            options={authorOptions}
                            value={selectedAuthors}
                            onChange={setSelectedAuthors}
                            placeholder="Filter by Author"
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <MultiSelect
                            label="Series"
                            options={seriesOptions}
                            value={selectedSeries}
                            onChange={setSelectedSeries}
                            placeholder="Filter by Series"
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, width: '150px', flexShrink: 0 }}>
                        <label className="form-label">PIN Status</label>
                        <select
                            className="form-select"
                            value={pinFilter}
                            onChange={(e) => setPinFilter(e.target.value as 'all' | 'pinned' | 'unpinned')}
                            style={{ height: '42px' }}
                        >
                            <option value="all">All</option>
                            <option value="pinned">Pinned Only</option>
                            <option value="unpinned">Not Pinned</option>
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategories([]);
                            setSelectedAuthors([]);
                            setSelectedSeries([]);
                            setPinFilter('all');
                            setSortConfig(null);
                        }}
                        className="btn-secondary"
                        style={{ height: '42px', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} className="sortable-header" style={{ width: '60px' }}>
                                <div className="th-content">
                                    ID {getSortIcon('id')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('name')} className="sortable-header">
                                <div className="th-content">
                                    Book {getSortIcon('name')}
                                </div>
                            </th>
                            <th>Category</th>
                            <th>Author</th>
                            <th>Series</th>
                            <th>Pin</th>
                            <th onClick={() => handleSort('price')} className="sortable-header">
                                <div className="th-content">
                                    Price {getSortIcon('price')}
                                </div>
                            </th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBooks.map(book => (
                            <tr key={book.id}>
                                <td>#{book.id}</td>
                                <td>
                                    <div className="info-cell">
                                        <img
                                            src={book.bookImageUrl}
                                            alt={book.name}
                                            className="info-book-image"
                                        />
                                        <div className="info-content">
                                            <div className="info-title">{book.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ maxWidth: '150px', lineHeight: '1.4' }}>
                                        {book.categories?.map(c => c.name).join(', ') || '-'}
                                    </div>
                                </td>
                                <td>{book.author.name}</td>
                                <td>{book.series?.name || '-'}</td>
                                <td>
                                    {book.pin ? (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            backgroundColor: 'var(--shop-accent-primary)',
                                            color: '#fff',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontWeight: 600,
                                            display: 'inline-block'
                                        }}>
                                            Pinned
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--shop-text-muted)', fontSize: '0.85rem' }}>-</span>
                                    )}
                                </td>
                                <td>
                                    <div>{formatCurrency(book.originalCost * (1 - (book.sale || 0) / 100))}</div>
                                    {book.sale > 0 && (
                                        <div className="info-subtitle" style={{ textDecoration: 'line-through' }}>
                                            {formatCurrency(book.originalCost)}
                                        </div>
                                    )}
                                </td>
                                <td>{book.stock}</td>
                                <td>
                                    <span className={`status-badge ${book.status === 'ENABLE' ? 'enable' : 'disable'}`}>
                                        {book.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => navigate(`/admin/manage-information/book-detail/${book.id}`)}
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => handleDelete(book.id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredBooks.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--shop-text-muted)' }}>
                        No books found matching your filters.
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default BookManagementPage;
