import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { mockEvents } from '../../../data/mockEvents';
import { mockPaymentMethods, mockCategories } from '../../../data/mockMasterData';
import { EventStatus } from '../../../types/Event';
import { EventType } from '../../../types/EventType';
import { EventRuleType } from '../../../types/EventRuleType';
import { EventTargetType } from '../../../types/EventTargetType';
import { EventActionType } from '../../../types/EventActionType';
import type { Event } from '../../../types/Event';
import '../../../styles/components/forms.css';
import '../../../styles/components/buttons.css';

const EventFormPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState<Partial<Event>>({
        name: '',
        description: '',
        type: EventType.SEASONAL_SALE,
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        status: EventStatus.DRAFT,
        priority: 0,
        rules: [],
        actions: [],
        targets: []
    });

    useEffect(() => {
        if (!isNew && id) {
            const event = mockEvents.find(e => e.id === parseInt(id));
            if (event) {
                // Convert typical ISO entries to local datetime-local input format if needed, 
                // but simple string slicing usually works for YYYY-MM-DDTHH:mm
                setFormData({
                    ...event,
                    startTime: event.startTime.slice(0, 16),
                    endTime: event.endTime.slice(0, 16)
                });
            }
        }
    }, [id, isNew]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Saved Event:', formData);
        alert('Event saved successfully!');
        navigate('/admin/manage-business/event');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'priority' ? parseInt(value) : value
        }));
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/admin/manage-business/event" className="btn-icon">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="admin-title">{isNew ? 'Create New Event' : 'Edit Event'}</h1>
                    </div>
                </div>
            </div>

            <div className="admin-content-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Event Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Event Type</label>
                            <select
                                name="type"
                                className="form-select"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                {Object.values(EventType).map(type => (
                                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                {Object.values(EventStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Start Time</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                className="form-input"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">End Time</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                className="form-input"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Priority (Higher runs first)</label>
                        <input
                            type="number"
                            name="priority"
                            className="form-input"
                            value={formData.priority}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            rows={4}
                            value={formData.description || ''}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Rules Section */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3 className="section-title">Event Rules</h3>
                            <button type="button" className="btn-secondary" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    rules: [...(prev.rules || []), { id: Date.now(), ruleType: 'MIN_ORDER_VALUE', ruleValue: '', event: {} as any }]
                                }));
                            }}>
                                <Plus size={16} /> Add Rule
                            </button>
                        </div>
                        {formData.rules?.map((rule, index) => (
                            <div key={index} className="dynamic-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Rule Type</label>
                                    <select
                                        className="form-select"
                                        value={rule.ruleType}
                                        onChange={(e) => {
                                            const newRules = [...(formData.rules || [])];
                                            newRules[index].ruleType = e.target.value as any;
                                            setFormData(prev => ({ ...prev, rules: newRules }));
                                        }}
                                    >
                                        {Object.values(EventRuleType).map(type => (
                                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Value</label>
                                    {(() => {
                                        const handleValueChange = (val: string) => {
                                            const newRules = [...(formData.rules || [])];
                                            newRules[index].ruleValue = val;
                                            setFormData(prev => ({ ...prev, rules: newRules }));
                                        };

                                        // Date Types
                                        if (([
                                            EventRuleType.USER_REGISTERED_BEFORE,
                                            EventRuleType.USER_REGISTERED_AFTER,
                                            EventRuleType.BOOK_PUBLISHED_AFTER
                                        ] as EventRuleType[]).includes(rule.ruleType)) {
                                            return (
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    value={rule.ruleValue}
                                                    onChange={(e) => handleValueChange(e.target.value)}
                                                />
                                            );
                                        }

                                        // Numeric Types
                                        if (([
                                            EventRuleType.MIN_ORDER_VALUE,
                                            EventRuleType.MAX_ORDER_VALUE,
                                            EventRuleType.MIN_QUANTITY,
                                            EventRuleType.MAX_QUANTITY,
                                            EventRuleType.EXACT_QUANTITY,
                                            EventRuleType.MIN_ITEMS_IN_CART,
                                            EventRuleType.MAX_USAGE_PER_USER,
                                            EventRuleType.MAX_USAGE_TOTAL,
                                            EventRuleType.MAX_USAGE_PER_DAY,
                                            EventRuleType.TOTAL_SPENT_MIN,
                                            EventRuleType.BOOK_PRICE_MIN
                                        ] as EventRuleType[]).includes(rule.ruleType)) {
                                            return (
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={rule.ruleValue}
                                                    placeholder="0"
                                                    onChange={(e) => handleValueChange(e.target.value)}
                                                />
                                            );
                                        }

                                        // Boolean / Toggle Types
                                        if (([
                                            EventRuleType.NEW_USER_ONLY,
                                            EventRuleType.FIRST_PURCHASE,
                                            EventRuleType.PURCHASED_BEFORE,
                                            EventRuleType.ONLINE_PAYMENT_ONLY,
                                            EventRuleType.IN_STOCK_ONLY,
                                            EventRuleType.EXCLUDE_SALE_ITEMS,
                                            EventRuleType.NEWSLETTER_SUBSCRIBED
                                        ] as EventRuleType[]).includes(rule.ruleType)) {
                                            return (
                                                <select
                                                    className="form-select"
                                                    value={rule.ruleValue}
                                                    onChange={(e) => handleValueChange(e.target.value)}
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="true">True</option>
                                                    <option value="false">False</option>
                                                </select>
                                            );
                                        }

                                        // Payment Method Select
                                        if (rule.ruleType === EventRuleType.PAYMENT_METHOD) {
                                            return (
                                                <select
                                                    className="form-select"
                                                    value={rule.ruleValue}
                                                    onChange={(e) => handleValueChange(e.target.value)}
                                                >
                                                    <option value="">Select Payment Method...</option>
                                                    {mockPaymentMethods.map(pm => (
                                                        <option key={pm.id} value={pm.name}>{pm.name}</option>
                                                    ))}
                                                </select>
                                            );
                                        }

                                        // Category Select
                                        if (rule.ruleType === EventRuleType.BOOK_CATEGORY || rule.ruleType === EventRuleType.MUST_INCLUDE_CATEGORY) {
                                            return (
                                                <select
                                                    className="form-select"
                                                    value={rule.ruleValue}
                                                    onChange={(e) => handleValueChange(e.target.value)}
                                                >
                                                    <option value="">Select Category...</option>
                                                    {mockCategories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            );
                                        }

                                        // Default Text Input
                                        return (
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={rule.ruleValue}
                                                placeholder="Value"
                                                onChange={(e) => handleValueChange(e.target.value)}
                                            />
                                        );
                                    })()}
                                </div>
                                <button
                                    type="button"
                                    className="btn-icon delete"
                                    onClick={() => {
                                        const newRules = formData.rules?.filter((_, i) => i !== index);
                                        setFormData(prev => ({ ...prev, rules: newRules }));
                                    }}
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {(!formData.rules || formData.rules.length === 0) && (
                            <p className="empty-text">No rules configured.</p>
                        )}
                    </div>

                    {/* Targets Section */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3 className="section-title">Event Targets</h3>
                            <button type="button" className="btn-secondary" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    targets: [...(prev.targets || []), { id: Date.now(), targetType: 'CATEGORY', targetId: 0, event: {} as any }]
                                }));
                            }}>
                                <Plus size={16} /> Add Target
                            </button>
                        </div>
                        {formData.targets?.map((target, index) => (
                            <div key={index} className="dynamic-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Target Type</label>
                                    <select
                                        className="form-select"
                                        value={target.targetType}
                                        onChange={(e) => {
                                            const newTargets = [...(formData.targets || [])];
                                            newTargets[index].targetType = e.target.value as any;
                                            setFormData(prev => ({ ...prev, targets: newTargets }));
                                        }}
                                    >
                                        {Object.values(EventTargetType).map(type => (
                                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Target ID</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={target.targetId}
                                        placeholder="ID (e.g. Category ID)"
                                        onChange={(e) => {
                                            const newTargets = [...(formData.targets || [])];
                                            newTargets[index].targetId = parseInt(e.target.value) || 0;
                                            setFormData(prev => ({ ...prev, targets: newTargets }));
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn-icon delete"
                                    onClick={() => {
                                        const newTargets = formData.targets?.filter((_, i) => i !== index);
                                        setFormData(prev => ({ ...prev, targets: newTargets }));
                                    }}
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {(!formData.targets || formData.targets.length === 0) && (
                            <p className="empty-text">No targets configured.</p>
                        )}
                    </div>

                    {/* Actions Section */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3 className="section-title">Event Actions</h3>
                            <button type="button" className="btn-secondary" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    actions: [...(prev.actions || []), { id: Date.now(), actionType: 'DISCOUNT_PERCENT', actionValue: '', event: {} as any }]
                                }));
                            }}>
                                <Plus size={16} /> Add Action
                            </button>
                        </div>
                        {formData.actions?.map((action, index) => (
                            <div key={index} className="dynamic-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Action Type</label>
                                    <select
                                        className="form-select"
                                        value={action.actionType}
                                        onChange={(e) => {
                                            const newActions = [...(formData.actions || [])];
                                            newActions[index].actionType = e.target.value as any;
                                            setFormData(prev => ({ ...prev, actions: newActions }));
                                        }}
                                    >
                                        {Object.values(EventActionType).map(type => (
                                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Value</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={action.actionValue}
                                        placeholder="e.g. 10 (for 10%)"
                                        onChange={(e) => {
                                            const newActions = [...(formData.actions || [])];
                                            newActions[index].actionValue = e.target.value;
                                            setFormData(prev => ({ ...prev, actions: newActions }));
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn-icon delete"
                                    onClick={() => {
                                        const newActions = formData.actions?.filter((_, i) => i !== index);
                                        setFormData(prev => ({ ...prev, actions: newActions }));
                                    }}
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {(!formData.actions || formData.actions.length === 0) && (
                            <p className="empty-text">No actions configured.</p>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/manage-business/event')}>
                            Cancel
                        </button>

                        <button type="submit" className="btn-primary">
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventFormPage;
