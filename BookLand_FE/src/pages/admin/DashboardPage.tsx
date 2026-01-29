import '../../styles/pages/admin-management.css';

const DashboardPage = () => {
    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <p className="admin-subtitle">Welcome to the admin dashboard. View statistics and overview here.</p>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--shop-text-muted)', backgroundColor: 'var(--shop-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--shop-border)' }}>
                Dashboard widgets and charts will go here.
            </div>
        </div>
    );
};

export default DashboardPage;
