import { useState, useEffect, useCallback } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    TrendingUp, ShoppingCart, BookOpen, Users, Package,
} from 'lucide-react';

import { formatCurrency } from '../../utils/formatters';
import dashboardService, {
    type DashboardPeriod,
    type RevenueDataPoint,
    type TopBook,
    type TopCustomer,
} from '../../api/dashboardService';
import '../../styles/pages/admin-management.css';
import '../../styles/pages/dashboard.css';

/* ── helpers ── */
const PERIODS: { key: DashboardPeriod; label: string }[] = [
    { key: 'week', label: '7 ngày' },
    { key: 'month', label: 'Tháng này' },
    { key: 'year', label: 'Năm nay' },
];

function RankBadge({ rank }: { rank: number }) {
    const cls = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-n';
    return <span className={`rank-badge ${cls}`}>{rank}</span>;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
    );
}

function SkeletonRows({ count = 5 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <tr key={i}>
                    <td colSpan={99}>
                        <div className="skeleton-row" />
                    </td>
                </tr>
            ))}
        </>
    );
}

/* ── Custom chart tooltip ── */
const RevenueTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--shop-bg-card)',
            border: '1px solid var(--shop-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>
            <p style={{ fontWeight: 700, marginBottom: 4, color: 'var(--shop-text-primary)' }}>{label}</p>
            <p style={{ color: '#764ba2', margin: 0 }}>
                Doanh thu: <strong>{formatCurrency(payload[0]?.value ?? 0)}</strong>
            </p>
            {payload[1] && (
                <p style={{ color: '#667eea', margin: 0 }}>
                    Đơn hàng: <strong>{payload[1].value}</strong>
                </p>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const DashboardPage = () => {

    /* ── Period states (each section independent) ── */
    const [revenuePeriod, setRevenuePeriod] = useState<DashboardPeriod>('month');
    const [booksPeriod, setBooksPeriod] = useState<DashboardPeriod>('month');
    const [customersPeriod, setCustomersPeriod] = useState<DashboardPeriod>('month');

    /* ── Data ── */
    const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
    const [topBooks, setTopBooks] = useState<TopBook[]>([]);
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

    /* ── Loading ── */
    const [loadingRevenue, setLoadingRevenue] = useState(false);
    const [loadingBooks, setLoadingBooks] = useState(false);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    /* ── Computed summary stats from revenue data ── */
    const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = revenueData.reduce((s, d) => s + d.orderCount, 0);
    const maxSold = Math.max(...topBooks.map(b => b.totalQuantitySold), 1);
    const maxSpent = Math.max(...topCustomers.map(c => c.totalSpent), 1);

    /* ── Fetchers ── */
    const fetchRevenue = useCallback(async (period: DashboardPeriod) => {
        setLoadingRevenue(true);
        try {
            const res = await dashboardService.getRevenue(period);
            setRevenueData(res.result ?? []);
        } catch {
            setRevenueData([]);
        } finally {
            setLoadingRevenue(false);
        }
    }, []);

    const fetchTopBooks = useCallback(async (period: DashboardPeriod) => {
        setLoadingBooks(true);
        try {
            const res = await dashboardService.getTopBooks(period, 10);
            setTopBooks(res.result ?? []);
        } catch {
            setTopBooks([]);
        } finally {
            setLoadingBooks(false);
        }
    }, []);

    const fetchTopCustomers = useCallback(async (period: DashboardPeriod) => {
        setLoadingCustomers(true);
        try {
            const res = await dashboardService.getTopCustomers(period, 10);
            setTopCustomers(res.result ?? []);
        } catch {
            setTopCustomers([]);
        } finally {
            setLoadingCustomers(false);
        }
    }, []);

    useEffect(() => { fetchRevenue(revenuePeriod); }, [revenuePeriod, fetchRevenue]);
    useEffect(() => { fetchTopBooks(booksPeriod); }, [booksPeriod, fetchTopBooks]);
    useEffect(() => { fetchTopCustomers(customersPeriod); }, [customersPeriod, fetchTopCustomers]);

    /* ── Period tabs helper ── */
    const PeriodTabs = ({
        value, onChange,
    }: { value: DashboardPeriod; onChange: (p: DashboardPeriod) => void }) => (
        <div className="period-tabs">
            {PERIODS.map(p => (
                <button
                    key={p.key}
                    className={`period-tab${value === p.key ? ' active' : ''}`}
                    onClick={() => onChange(p.key)}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );

    /* ── Period label for display ── */
    const periodLabel = (p: DashboardPeriod) =>
        PERIODS.find(x => x.key === p)?.label ?? '';

    /* ══════════════════ RENDER ══════════════════ */
    return (
        <div className="admin-container">
            {/* Page Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">📊 Dashboard</h1>
                    <p className="admin-subtitle">Tổng quan doanh thu &amp; hoạt động kinh doanh</p>
                </div>
            </div>

            {/* ── Summary stat cards (based on revenue period) ── */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{formatCurrency(totalRevenue)}</div>
                        <div className="stat-label">Doanh thu ({periodLabel(revenuePeriod)})</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orders">
                        <ShoppingCart size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{totalOrders.toLocaleString()}</div>
                        <div className="stat-label">Đơn hoàn thành ({periodLabel(revenuePeriod)})</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon books">
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{topBooks.length > 0 ? topBooks[0].bookName : '—'}</div>
                        <div className="stat-label">Sách bán chạy nhất ({periodLabel(booksPeriod)})</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon customers">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{topCustomers.length > 0 ? topCustomers[0].username : '—'}</div>
                        <div className="stat-label">Khách hàng VIP ({periodLabel(customersPeriod)})</div>
                    </div>
                </div>
            </div>

            {/* ══════════════ REVENUE CHART ══════════════ */}
            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2 className="dashboard-section-title">
                        <span className="icon-dot" />
                        Biểu đồ doanh thu
                    </h2>
                    <PeriodTabs value={revenuePeriod} onChange={setRevenuePeriod} />
                </div>

                <div className="chart-wrapper">
                    {loadingRevenue ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--shop-text-muted)' }}>
                            Đang tải dữ liệu…
                        </div>
                    ) : revenueData.length === 0 ? (
                        <div className="dashboard-empty">Không có dữ liệu trong khoảng thời gian này.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#764ba2" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--shop-border)" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 12, fill: 'var(--shop-text-muted)' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    yAxisId="revenue"
                                    orientation="left"
                                    tick={{ fontSize: 11, fill: 'var(--shop-text-muted)' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => {
                                        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                                        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                                        return String(v);
                                    }}
                                    width={60}
                                />
                                <YAxis
                                    yAxisId="orders"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: '#667eea' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={30}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<RevenueTooltip />} />
                                <Area
                                    yAxisId="revenue"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#764ba2"
                                    strokeWidth={2.5}
                                    fill="url(#colorRevenue)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#764ba2' }}
                                />
                                <Area
                                    yAxisId="orders"
                                    type="monotone"
                                    dataKey="orderCount"
                                    stroke="#667eea"
                                    strokeWidth={2}
                                    fill="url(#colorOrders)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#667eea' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Chart legend */}
                <div style={{ display: 'flex', gap: '1.5rem', padding: '0 1.5rem 1rem', fontSize: '0.82rem', color: 'var(--shop-text-muted)' }}>
                    <span><span style={{ display: 'inline-block', width: 12, height: 3, background: '#764ba2', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />Doanh thu (VND)</span>
                    <span><span style={{ display: 'inline-block', width: 12, height: 3, background: '#667eea', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />Số đơn hoàn thành</span>
                </div>
            </div>

            {/* ══════════════ 2-COL GRID: Top Books + Top Customers ══════════════ */}
            <div className="dashboard-grid-2">

                {/* ── TOP SELLING BOOKS ── */}
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2 className="dashboard-section-title">
                            <span className="icon-dot" />
                            Sách bán chạy nhất
                        </h2>
                        <PeriodTabs value={booksPeriod} onChange={setBooksPeriod} />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 36 }}>#</th>
                                    <th>Sách</th>
                                    <th style={{ textAlign: 'right' }}>SL bán</th>
                                    <th style={{ textAlign: 'right' }}>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingBooks ? (
                                    <SkeletonRows count={6} />
                                ) : topBooks.length === 0 ? (
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="dashboard-empty">Chưa có dữ liệu.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    topBooks.map((book, idx) => (
                                        <tr key={book.bookId}>
                                            <td><RankBadge rank={idx + 1} /></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {book.bookImageUrl ? (
                                                        <img
                                                            src={book.bookImageUrl}
                                                            alt={book.bookName}
                                                            className="book-thumb"
                                                        />
                                                    ) : (
                                                        <div className="book-thumb-placeholder">
                                                            <Package size={16} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.88rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {book.bookName}
                                                        </div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--shop-text-muted)' }}>
                                                            {book.authorName}
                                                        </div>
                                                        <ProgressBar value={book.totalQuantitySold} max={maxSold} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#764ba2' }}>
                                                {book.totalQuantitySold.toLocaleString()}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.85rem' }}>
                                                {formatCurrency(book.totalRevenue)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── TOP CUSTOMERS ── */}
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2 className="dashboard-section-title">
                            <span className="icon-dot" />
                            Khách hàng mua nhiều nhất
                        </h2>
                        <PeriodTabs value={customersPeriod} onChange={setCustomersPeriod} />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 36 }}>#</th>
                                    <th>Khách hàng</th>
                                    <th style={{ textAlign: 'right' }}>Đơn hàng</th>
                                    <th style={{ textAlign: 'right' }}>Tổng chi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingCustomers ? (
                                    <SkeletonRows count={6} />
                                ) : topCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="dashboard-empty">Chưa có dữ liệu.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    topCustomers.map((cust, idx) => (
                                        <tr key={cust.userId}>
                                            <td><RankBadge rank={idx + 1} /></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {/* Avatar circle */}
                                                    <div style={{
                                                        width: 38, height: 38, borderRadius: '50%',
                                                        background: `hsl(${(cust.userId * 57) % 360}, 60%, 65%)`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                                                    }}>
                                                        {cust.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cust.username}</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--shop-text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {cust.email}
                                                        </div>
                                                        <ProgressBar value={cust.totalSpent} max={maxSpent} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#43e97b' }}>
                                                {cust.totalOrders.toLocaleString()}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.85rem' }}>
                                                {formatCurrency(cust.totalSpent)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>{/* end grid */}
        </div>
    );
};

export default DashboardPage;
