import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Serie } from '../../../types/Serie';
import serieService from '../../../api/serieService';
import AdminModal, { type FieldConfig } from '../../../components/admin/AdminModal';
import Pagination from '../../../components/admin/Pagination';
import '../../../styles/components/buttons.css';
import '../../../styles/components/forms.css';
import '../../../styles/pages/admin-management.css';
import { toast } from 'react-toastify';

const SeriePage = () => {
    const [series, setSeries] = useState<Serie[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Server-side Pagination & Sort State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Serie; direction: 'asc' | 'desc' } | null>({ key: 'id', direction: 'asc' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update' | 'view'>('create');
    const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null);

    const fetchSeries = async () => {
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

            const response = await serieService.getAllSeries(params);
            if (response.result) {
                if (response.result.content && typeof response.result.totalPages === 'number') {
                    setSeries(response.result.content);
                    setTotalPages(response.result.totalPages);
                } else if (Array.isArray(response.result)) {
                    setSeries(response.result);
                    setTotalPages(1);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load series");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSeries();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, sortConfig, searchTerm]);

    const fieldConfig: FieldConfig[] = [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Series Name' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'About the series...' }
    ];

    const handleSort = (key: keyof Serie) => {
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

    const openModal = (mode: 'create' | 'update' | 'view', serie?: Serie) => {
        setModalMode(mode);
        setSelectedSerie(serie || null);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (data: any) => {
        try {
            if (modalMode === 'update' && selectedSerie) {
                await serieService.updateSerie(selectedSerie.id, data);
                toast.success("Series updated successfully");
            } else if (modalMode === 'create') {
                await serieService.createSerie(data);
                toast.success("Series created successfully");
            }
            fetchSeries();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this series?')) {
            try {
                await serieService.deleteSerie(id);
                toast.success("Series deleted successfully");
                fetchSeries();
            } catch (error) {
                console.error(error);
                toast.error("Delete failed");
            }
        }
    };

    const getSortIcon = (key: keyof Serie) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="sort-icon inactive" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Series Management</h1>
                    <p className="admin-subtitle">Manage book series</p>
                </div>
                <button className="btn-primary" onClick={() => openModal('create')}>
                    <Plus size={20} />
                    Add Series
                </button>
            </div>

            <div className="admin-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search series by name or description..."
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
                        {series.map(serie => (
                            <tr key={serie.id}>
                                <td>#{serie.id}</td>
                                <td style={{ fontWeight: 500 }}>{serie.name}</td>
                                <td style={{ color: 'var(--shop-text-muted)' }}>{serie.description || '-'}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="action-buttons">
                                        <button className="btn-icon" onClick={() => openModal('view', serie)}>
                                            <Eye size={18} />
                                        </button>
                                        <button className="btn-icon" onClick={() => openModal('update', serie)}>
                                            <Edit size={18} />
                                        </button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(serie.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {series.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No series found.
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
                title={`${modalMode.charAt(0).toUpperCase() + modalMode.slice(1)} Series`}
                fields={fieldConfig}
                initialData={selectedSerie}
            />
        </div>
    );
};

export default SeriePage;
