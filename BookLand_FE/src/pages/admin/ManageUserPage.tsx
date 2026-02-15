import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Mail, Phone, ArrowUpDown, ArrowUp, ArrowDown, Loader2, Plus, Edit } from 'lucide-react';
import type { User } from '../../types/User';
import type { Role } from '../../types/Role';
import userService from '../../api/userService';
import roleService from '../../api/roleService';
import Pagination from '../../components/admin/Pagination';
import { toast } from 'react-toastify';
import '../../styles/components/buttons.css';
import '../../styles/pages/admin-management.css';

const ManageUserPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage] = useState(10);

    // Sort State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'id', direction: 'asc' });

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: currentPage - 1,
                size: itemsPerPage,
                keyword: searchTerm,
                roleId: selectedRoleId || undefined,
            };

            if (sortConfig) {
                params.sortBy = sortConfig.key;
                params.sortDirection = sortConfig.direction;
            }

            const response = await userService.getAllUsers(params);
            if (response.result) {
                setUsers(response.result.content);
                setTotalPages(response.result.totalPages);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, selectedRoleId, sortConfig]);

    // Fetch roles on mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await roleService.getAllRoles({ size: 100 });
                if (response.result) {
                    setAvailableRoles(response.result.content);
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await userService.adminDeleteUser(id);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
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
                    <h1 className="admin-title">Manage Users</h1>
                    <p className="admin-subtitle">View and manage customer accounts</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/admin/manage-user/new')}>
                    <Plus size={20} />
                    Add Staff / Admin / Supporter
                </button>
            </div>

            {/* Search and Filters */}
            <div className="admin-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search users by name, email, phone..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Role Filter */}
                <select
                    className="form-select"
                    style={{ width: '200px' }}
                    value={selectedRoleId || ''}
                    onChange={(e) => {
                        setSelectedRoleId(e.target.value ? Number(e.target.value) : null);
                        setCurrentPage(1);
                    }}
                >
                    <option value="">All Roles</option>
                    {availableRoles.map(role => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
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
                                <th onClick={() => handleSort('username')} className="sortable-header">
                                    <div className="th-content">
                                        User Info {getSortIcon('username')}
                                    </div>
                                </th>
                                <th>Contact</th>
                                <th>Role</th>
                                <th onClick={() => handleSort('status')} className="sortable-header">
                                    <div className="th-content">
                                        Status {getSortIcon('status')}
                                    </div>
                                </th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        <div className="info-cell">
                                            <div className="info-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--shop-bg-secondary)', color: 'var(--shop-accent-primary)' }}>
                                                <span style={{ fontWeight: 600 }}>{(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}</span>
                                            </div>
                                            <div className="info-content">
                                                <div className="info-title">Full Name: {user.firstName} {user.lastName}</div>
                                                <div className="info-subtitle">User Name: {user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Mail size={14} className="text-muted" />
                                                {user.email}
                                            </div>
                                            {user.phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Phone size={14} className="text-muted" />
                                                    {user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {user.roles?.map(r => (
                                                <span key={r.id} style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                                                    {r.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.status === 'ENABLE' ? 'enable' : 'disable'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {/* 
                                            <button className="btn-icon" title="View Details">
                                                <Eye size={18} />
                                            </button>
                                            */}
                                            <button className="btn-icon" title="Edit" onClick={() => navigate(`/admin/manage-user/${user.id}`)}>
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                onClick={() => handleDelete(user.id)}
                                                title="Delete User"
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
                {!isLoading && users.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--shop-text-muted)' }}>
                        No users found.
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

export default ManageUserPage;
