import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import '../styles/pages/books.css';
import categoryService from '../api/categoryService';
import authorService from '../api/authorService';
import publisherService from '../api/publisherService';
import serieService from '../api/serieService';

interface FilterSidebarProps {
    selectedCategoryIds: number[];
    onCategoryToggle: (id: number) => void;
    onCategoryClear: () => void;
    selectedPriceRange: string;
    onPriceRangeChange: (range: string) => void;
    selectedAuthorIds: number[];
    onAuthorToggle: (id: number) => void;
    onAuthorClear: () => void;
    selectedPublisherIds: number[];
    onPublisherToggle: (id: number) => void;
    onPublisherClear: () => void;
    selectedSeriesIds: number[];
    onSeriesToggle: (id: number) => void;
    onSeriesClear: () => void;
    onClearAll: () => void;
    isMobileOpen?: boolean;
    onClose?: () => void;
}

const FilterSidebar = ({
    selectedCategoryIds = [],
    onCategoryToggle = () => { },
    onCategoryClear = () => { },
    selectedPriceRange = '',
    onPriceRangeChange = () => { },
    selectedAuthorIds = [],
    onAuthorToggle = () => { },
    onAuthorClear = () => { },
    selectedPublisherIds = [],
    onPublisherToggle = () => { },
    onPublisherClear = () => { },
    selectedSeriesIds = [],
    onSeriesToggle = () => { },
    onSeriesClear = () => { },
    onClearAll = () => { },
    isMobileOpen = false,
    onClose = () => { }
}: FilterSidebarProps) => {

    const priceRanges = [
        { label: '0đ - 150,000đ', value: '0-150000' },
        { label: '150,000đ - 300,000đ', value: '150000-300000' },
        { label: '300,000đ - 500,000đ', value: '300000-500000' },
        { label: '500,000đ - 700,000đ', value: '500000-700000' },
        { label: '700,000đ - Trở Lên', value: '700000-up' },
    ];

    return (
        <aside className={`filter-sidebar ${isMobileOpen ? 'filter-sidebar--mobile-open' : ''}`}>
            <div className="filter-sidebar__header">
                <h2 className="filter-sidebar__title">BỘ LỌC TÌM KIẾM</h2>
                <button className="filter-sidebar__close" onClick={onClose}>×</button>
            </div>

            <div className="filter-global-actions">
                <button className="btn-clear-all-global" onClick={onClearAll}>
                    <X size={14} /> Xóa tất cả lọc
                </button>
            </div>

            <div className="filter-divider"></div>

            {/* Price Filter - Moved to TOP */}
            <div className="filter-section">
                <h3 className="filter-section__title">MỨC GIÁ</h3>
                <div className="filter-checkbox-list">
                    {priceRanges.map((range) => (
                        <label key={range.value} className="filter-checkbox-item">
                            <input
                                type="checkbox"
                                checked={selectedPriceRange === range.value}
                                onChange={() => onPriceRangeChange(range.value)}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="filter-divider"></div>

            {/* Category Filter */}
            <SearchableFilterSection
                title="DANH MỤC THỂ LOẠI"
                placeholder="Tìm thể loại..."
                onSearch={async (query) => {
                    const res = await categoryService.getAll({ keyword: query, size: 10 });
                    return res.result?.content || [];
                }}
                selectedIds={selectedCategoryIds}
                onToggle={onCategoryToggle}
                onClear={onCategoryClear}
            />

            <div className="filter-divider"></div>

            {/* Author Filter */}
            <SearchableFilterSection
                title="TÁC GIẢ"
                placeholder="Tìm tác giả..."
                onSearch={async (query) => {
                    const res = await authorService.getAllAuthors({ keyword: query, size: 10 });
                    return res.result?.content || [];
                }}
                selectedIds={selectedAuthorIds}
                onToggle={onAuthorToggle}
                onClear={onAuthorClear}
            />

            <div className="filter-divider"></div>

            {/* Publisher Filter */}
            <SearchableFilterSection
                title="NHÀ XUẤT BẢN"
                placeholder="Tìm nhà xuất bản..."
                onSearch={async (query) => {
                    const res = await publisherService.getAllPublishers({ keyword: query, size: 10 });
                    return res.result?.content || [];
                }}
                selectedIds={selectedPublisherIds}
                onToggle={onPublisherToggle}
                onClear={onPublisherClear}
            />

            <div className="filter-divider"></div>

            {/* Series Filter */}
            <SearchableFilterSection
                title="PHÂN LOẠI SERIES"
                placeholder="Tìm series..."
                onSearch={async (query) => {
                    const res = await serieService.getAllSeries({ keyword: query, size: 10 });
                    return res.result?.content || [];
                }}
                selectedIds={selectedSeriesIds}
                onToggle={onSeriesToggle}
                onClear={onSeriesClear}
            />
        </aside>
    );
};

// Reusable Searchable Filter Component
const SearchableFilterSection = <T extends { id: number; name: string }>({
    title,
    placeholder,
    onSearch,
    selectedIds,
    onToggle,
    onClear
}: {
    title: string;
    placeholder: string;
    onSearch: (query: string) => Promise<T[]>;
    selectedIds: number[];
    onToggle: (id: number) => void;
    onClear?: () => void;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<T[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNames, setSelectedNames] = useState<Record<number, string>>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced Search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const items = await onSearch(searchTerm);
                setResults(items);
            } catch (error) {
                console.error(`Search error for ${title}:`, error);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch, title]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="filter-section" ref={dropdownRef}>
            <h3 className="filter-section__title">{title}</h3>
            <div className="filter-search-box">
                <div className="filter-search-input-wrapper">
                    <Search size={14} className="filter-search-icon" />
                    <input
                        type="text"
                        className="filter-search-input"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                    />
                    {isLoading && <div className="filter-search-loader"></div>}
                </div>

                {isOpen && results.length > 0 && (
                    <div className="filter-search-dropdown">
                        {results.map((item) => (
                            <div
                                key={item.id}
                                className={`filter-search-item ${selectedIds.includes(item.id) ? 'selected' : ''}`}
                                onClick={() => {
                                    if (!selectedIds.includes(item.id)) {
                                        onToggle(item.id);
                                        setSelectedNames(prev => ({ ...prev, [item.id]: item.name }));
                                    }
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                            >
                                {item.name}
                                {selectedIds.includes(item.id) && <span className="check-icon">✓</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="filter-tags">
                    {selectedIds.map((id) => (
                        <div key={id} className="filter-tag">
                            <span className="filter-tag-label">{selectedNames[id] || `ID: ${id}`}</span>
                            <button
                                className="filter-tag-remove"
                                onClick={() => onToggle(id)}
                                aria-label="Remove filter"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <button className="filter-clear-all" onClick={() => {
                        onClear?.();
                        setSelectedNames({});
                    }}>
                        Xóa hết
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilterSidebar;
