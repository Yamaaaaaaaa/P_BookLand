import { mockUsers } from '../../data/mockUsers';
import '../../styles/base.css'; // Reuse base styles for now or basic table

const ManageUserPage = () => {
    return (
        <div className="admin-page">
            <h1 className="admin-page__title">Manage Users</h1>
            <div className="admin-table-container">
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '12px' }}>ID</th>
                            <th style={{ padding: '12px' }}>Username</th>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Role</th>
                            <th style={{ padding: '12px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>{user.id}</td>
                                <td style={{ padding: '12px' }}>{user.username}</td>
                                <td style={{ padding: '12px' }}>{user.email}</td>
                                <td style={{ padding: '12px' }}>{user.firstName} {user.lastName}</td>
                                <td style={{ padding: '12px' }}>{user.roles?.map(r => r.name).join(', ')}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: user.status === 'ENABLE' ? '#e6f4ea' : '#fce8e6',
                                        color: user.status === 'ENABLE' ? '#1e7e34' : '#d93025'
                                    }}>
                                        {user.status}
                                    </span>
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
