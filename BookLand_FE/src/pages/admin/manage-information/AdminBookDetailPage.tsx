import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { getBookById } from '../../../data/mockBooks';
import { mockAuthors, mockPublishers, mockCategories, mockSeries } from '../../../data/mockMasterData';
import { BookStatus } from '../../../types/Book';
import type { Book } from '../../../types/Book';
import type { Author } from '../../../types/Author';
import type { Publisher } from '../../../types/Publisher';
import type { Serie } from '../../../types/Serie';
import '../../../styles/components/buttons.css';
import '../../../styles/components/forms.css';
import '../../../styles/pages/admin-management.css';

const AdminBookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState<Partial<Book>>({
        name: '',
        description: '',
        originalCost: 0,
        sale: 0,
        stock: 0,
        status: BookStatus.ENABLE,
        publishedDate: new Date().toISOString().split('T')[0],
        bookImageUrl: '',
        pin: false,
        author: undefined,
        publisher: undefined,
        series: undefined,
        categories: []
    });

    useEffect(() => {
        if (!isNew && id) {
            const book = getBookById(Number(id));
            if (book) {
                setFormData(book);
            } else {
                alert('Book not found');
                navigate('/admin/manage-information/book');
            }
        }
    }, [id, isNew, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'author' | 'publisher' | 'series') => {
        const id = Number(e.target.value);
        let selectedItem: Author | Publisher | Serie | undefined;

        if (type === 'author') selectedItem = mockAuthors.find(a => a.id === id);
        if (type === 'publisher') selectedItem = mockPublishers.find(p => p.id === id);
        if (type === 'series') selectedItem = mockSeries.find(s => s.id === id);

        setFormData(prev => ({ ...prev, [type]: selectedItem }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
        const selectedCategories = mockCategories.filter(c => selectedOptions.includes(c.id));
        setFormData(prev => ({ ...prev, categories: selectedCategories }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Saving book:', formData);
        alert('Book saved successfully! (Mock Action)');
        navigate('/admin/manage-information/book');
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/admin/manage-information/book" className="btn-secondary" style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="admin-title">{isNew ? 'Add New Book' : 'Edit Book'}</h1>
                        <p className="admin-subtitle">{isNew ? 'Create a new book entry' : `Editing #${id}`}</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={handleSubmit}>
                    <Save size={20} />
                    Save Book
                </button>
            </div>

            <div className="form-container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column: Main Info */}
                <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--shop-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--shop-border)' }}>
                    <div className="form-group margin-bottom">
                        <label className="form-label">Book Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group margin-bottom">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            rows={5}
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid-2 margin-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Original Price (VND)</label>
                            <input
                                type="number"
                                name="originalCost"
                                className="form-input"
                                value={formData.originalCost}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sale (%)</label>
                            <input
                                type="number"
                                name="sale"
                                className="form-input"
                                value={formData.sale}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid-2 margin-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                className="form-input"
                                value={formData.stock}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Published Date</label>
                            <input
                                type="date"
                                name="publishedDate"
                                className="form-input"
                                value={formData.publishedDate?.toString().split('T')[0]}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Classification & Image */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--shop-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--shop-border)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Status & Visibility</h3>

                        <div className="form-group margin-bottom">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value={BookStatus.ENABLE}>Enabled</option>
                                <option value={BookStatus.DISABLE}>Disabled</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                name="pin"
                                id="pin"
                                checked={formData.pin}
                                onChange={handleChange}
                                style={{ width: '1.2rem', height: '1.2rem' }}
                            />
                            <label htmlFor="pin" style={{ cursor: 'pointer' }}>Pin to Homepage</label>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--shop-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--shop-border)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Classification</h3>

                        <div className="form-group margin-bottom">
                            <label className="form-label">Author</label>
                            <select
                                className="form-select"
                                value={formData.author?.id || ''}
                                onChange={(e) => handleSelectChange(e, 'author')}
                            >
                                <option value="">Select Author</option>
                                {mockAuthors.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group margin-bottom">
                            <label className="form-label">Publisher</label>
                            <select
                                className="form-select"
                                value={formData.publisher?.id || ''}
                                onChange={(e) => handleSelectChange(e, 'publisher')}
                            >
                                <option value="">Select Publisher</option>
                                {mockPublishers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group margin-bottom">
                            <label className="form-label">Category</label>
                            <select
                                multiple
                                className="form-select"
                                style={{ height: '100px' }}
                                value={formData.categories?.map(c => String(c.id)) || []}
                                onChange={handleCategoryChange}
                            >
                                {mockCategories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <small style={{ color: 'var(--shop-text-muted)', fontSize: '0.8rem' }}>Hold Ctrl/Cmd to select multiple</small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Series (Optional)</label>
                            <select
                                className="form-select"
                                value={formData.series?.id || ''}
                                onChange={(e) => handleSelectChange(e, 'series')}
                            >
                                <option value="">None</option>
                                {mockSeries.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--shop-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--shop-border)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Book Image</h3>
                        <div className="form-group margin-bottom">
                            <label className="form-label">Image URL</label>
                            <input
                                type="text"
                                name="bookImageUrl"
                                className="form-input"
                                value={formData.bookImageUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>

                        {formData.bookImageUrl && (
                            <div style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--shop-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--shop-bg-secondary)' }}>
                                <img src={formData.bookImageUrl} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBookDetailPage;
