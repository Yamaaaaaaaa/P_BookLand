import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Loader2, Plus, Edit } from 'lucide-react';
import type { Role } from '../../types/Role';
import roleService from '../../api/roleService';
import Pagination from '../../components/admin/Pagination';
import { toast } from 'react-toastify';
import '../../styles/components/buttons.css';
import '../../styles/pages/admin-management.css';

const ManageRolePage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'id', direction: 'asc' });

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: currentPage - 1,
                size: itemsPerPage,
                keyword: searchTerm,
            };

            if (sortConfig) {
                params.sortBy = sortConfig.key;
                params.sortDirection = sortConfig.direction;
            }

            const response = await roleService.getAllRoles(params);
            if (response.result) {
                setRoles(response.result.content);
                setTotalPages(response.result.totalPages);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Failed to load roles');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, sortConfig]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRoles();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchRoles]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            try {
                await roleService.deleteRole(id);
                toast.success('Role deleted successfully');
                fetchRoles();
            } catch (error: any) {
                console.error('Error deleting role:', error);
                toast.error(error.response?.data?.message || 'Failed to delete role');
            }
        }
    };

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', description: '' });
        setSelectedRole(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (role: Role) => {
        setModalMode('edit');
        setSelectedRole(role);
        setFormData({ name: role.name, description: role.description || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await roleService.createRole(formData);
                toast.success('Role created successfully');
            } else if (selectedRole) {
                // Chỉ update description, không update name
                await roleService.updateRole(selectedRole.id, {
                    name: selectedRole.name, // Giữ nguyên name
                    description: formData.description
                });
                toast.success('Role updated successfully');
            }
            setShowModal(false);
            fetchRoles();
        } catch (error: any) {
            console.error('Error saving role:', error);
            toast.error(error.response?.data?.message || 'Failed to save role');
        }
    };

    const getSortIcon = (key: string) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="sort-icon inactive" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Manage Roles</h1>
                    <p className="admin-subtitle">View and manage user roles</p>
                </div>
                <button className="btn-primary" onClick={handleOpenCreateModal}>
                    <Plus size={20} />
                    Add Role
                </button>
            </div>

            {/* Search */}
            <div className="admin-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search roles by name or description..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="admin-table-container">
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')} className="sortable-header" style={{ width: '80px' }}>
                                    <div className="th-content">
                                        ID {getSortIcon('id')}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('name')} className="sortable-header">
                                    <div className="th-content">
                                        Role Name {getSortIcon('name')}
                                    </div>
                                </th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id}>
                                    <td>#{role.id}</td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--shop-accent-primary)' }}>
                                            {role.name}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--shop-text-muted)' }}>
                                            {role.description || 'No description'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" title="Edit" onClick={() => handleOpenEditModal(role)}>
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                onClick={() => handleDelete(role.id)}
                                                title="Delete Role"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!isLoading && roles.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--shop-text-muted)' }}>
                        No roles found.
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{modalMode === 'create' ? 'Create New Role' : 'Edit Role'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Role Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={modalMode === 'edit'} // Không cho edit name
                                    style={{ backgroundColor: modalMode === 'edit' ? '#f3f4f6' : 'white' }}
                                />
                                {modalMode === 'edit' && (
                                    <small style={{ color: 'var(--shop-text-muted)' }}>Role name cannot be changed</small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Enter role description..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {modalMode === 'create' ? 'Create' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRolePage;
