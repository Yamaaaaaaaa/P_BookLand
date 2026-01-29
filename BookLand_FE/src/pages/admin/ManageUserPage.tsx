import { mockUsers } from '../../data/mockUsers';
import { Search, Eye, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import '../../styles/components/buttons.css';
import '../../styles/pages/admin-management.css';

const ManageUserPage = () => {
    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Manage Users</h1>
                    <p className="admin-subtitle">View and manage customer accounts</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="admin-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search users..."
                    />
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Info</th>
                            <th>Contact</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockUsers.map(user => (
                            <tr key={user.id}>
                                <td>#{user.id}</td>
                                <td>
                                    <div className="info-cell">
                                        <div className="info-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontWeight: 600 }}>{user.username.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="info-content">
                                            <div className="info-title">{user.firstName} {user.lastName}</div>
                                            <div className="info-subtitle">@{user.username}</div>
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
                                        <button className="btn-icon" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        <button className="btn-icon" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUserPage;
