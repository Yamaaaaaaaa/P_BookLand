import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockEvents } from '../../../data/mockEvents';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EventStatus } from '../../../types/Event';
import { EventType } from '../../../types/EventType';
import Pagination from '../../../components/admin/Pagination';
import MultiSelect from '../../../components/admin/MultiSelect';
import type { Event } from '../../../types/Event';
import '../../../styles/components/buttons.css';
import '../../../styles/pages/admin-management.css';

const EventPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>(mockEvents);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [selectedStatuses, setSelectedStatuses] = useState<(string | number)[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<(string | number)[]>([]);

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Options
    const statusOptions = Object.values(EventStatus).map(status => ({ value: status, label: status }));
    const typeOptions = Object.values(EventType).map(type => ({ value: type, label: type.replace(/_/g, ' ') }));

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="sort-icon inactive" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(prev => prev.filter(e => e.id !== id));
        }
    };

    const filteredEvents = useMemo(() => {
        let result = events.filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            if (selectedStatuses.length > 0 && !selectedStatuses.includes(event.status)) return false;
            if (selectedTypes.length > 0 && !selectedTypes.includes(event.type)) return false;

            return true;
        });

        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Event];
                const bValue = b[sortConfig.key as keyof Event];

                if (aValue === undefined || bValue === undefined) return 0;

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [events, searchTerm, selectedStatuses, selectedTypes, sortConfig]);

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Events & Promotions</h1>
                    <p className="admin-subtitle">Manage sales, discounts, and notifications</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/admin/manage-business/event/new')}
                >
                    <Plus size={18} />
                    Add Event
                </button>
            </div>

            <div className="admin-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                <div className="search-box">
                    <Search size={18} className="search-box-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <MultiSelect
                            label="Status"
                            options={statusOptions}
                            value={selectedStatuses}
                            onChange={setSelectedStatuses}
                            placeholder="All Statuses"
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <MultiSelect
                            label="Event Type"
                            options={typeOptions}
                            value={selectedTypes}
                            onChange={setSelectedTypes}
                            placeholder="All Types"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedStatuses([]);
                            setSelectedTypes([]);
                            setSortConfig(null);
                        }}
                        className="btn-secondary"
                        style={{ height: '42px', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} className="sortable-header">
                                <div className="th-content">ID {getSortIcon('id')}</div>
                            </th>
                            <th className="sortable-header">
                                <div className="th-content">Name</div>
                            </th>
                            <th className="sortable-header">
                                <div className="th-content">Type</div>
                            </th>
                            <th onClick={() => handleSort('startTime')} className="sortable-header">
                                <div className="th-content">Start Date {getSortIcon('startTime')}</div>
                            </th>
                            <th onClick={() => handleSort('priority')} className="sortable-header">
                                <div className="th-content">Priority {getSortIcon('priority')}</div>
                            </th>
                            <th className="sortable-header">
                                <div className="th-content">Status</div>
                            </th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEvents.map(event => (
                            <tr key={event.id}>
                                <td>#{event.id}</td>
                                <td style={{ fontWeight: 500 }}>{event.name}</td>
                                <td>
                                    <span style={{
                                        backgroundColor: 'var(--shop-bg-secondary)',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {event.type.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        {new Date(event.startTime).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--shop-text-muted)' }}>
                                        {new Date(event.endTime).toLocaleDateString()}
                                    </div>
                                </td>
                                <td>{event.priority}</td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        backgroundColor: event.status === 'ACTIVE' ? '#e6f4ea' : '#f1f3f4',
                                        color: event.status === 'ACTIVE' ? '#1e7e34' : '#5f6368'
                                    }}>
                                        {event.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            title="Edit"
                                            onClick={() => navigate(`/admin/manage-business/event/${event.id}`)}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            title="Delete"
                                            onClick={() => handleDelete(event.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredEvents.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--shop-text-muted)' }}>
                        No events found matching your filters.
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

export default EventPage;
