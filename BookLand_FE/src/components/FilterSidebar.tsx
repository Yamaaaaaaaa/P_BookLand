import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/pages/books.css';
import { mockCategories } from '../data/mockMasterData';

interface FilterSidebarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    selectedPriceRange: string;
    onPriceRangeChange: (range: string) => void;
    isMobileOpen?: boolean;
    onClose?: () => void;
}

const FilterSidebar = ({
    selectedCategory,
    onCategoryChange,
    selectedPriceRange,
    onPriceRangeChange,
    isMobileOpen,
    onClose
}: FilterSidebarProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const priceRanges = [
        { label: '0đ - 150,000đ', value: '0-150000' },
        { label: '150,000đ - 300,000đ', value: '150000-300000' },
        { label: '300,000đ - 500,000đ', value: '300000-500000' },
        { label: '500,000đ - 700,000đ', value: '500000-700000' },
        { label: '700,000đ - Trở Lên', value: '700000-up' },
    ];

    // Limit to 7 items initially (1 "All" + 6 categories)
    const displayedCategories = isExpanded ? mockCategories : mockCategories.slice(0, 6);

    return (
        <aside className={`filter-sidebar ${isMobileOpen ? 'filter-sidebar--mobile-open' : ''}`}>
            <div className="filter-sidebar__header">
                <button className="filter-sidebar__close" onClick={onClose}>×</button>
            </div>

            {/* Product Groups - Dynamic Categories */}
            <div className="filter-section">
                <h3 className="filter-section__title">DANH MỤC THỂ LOẠI</h3>
                <div className="category-tree">
                    <ul className="category-list">
                        <li
                            className={`category-list__item ${selectedCategory === 'All' ? 'active' : ''}`}
                            onClick={() => onCategoryChange('All')}
                        >
                            Tất cả sản phẩm
                        </li>
                        {displayedCategories.map((cat) => (
                            <li
                                key={cat.id}
                                className={`category-list__item ${selectedCategory === cat.id.toString() ? 'active' : ''}`}
                                onClick={() => onCategoryChange(cat.id.toString())}
                            >
                                {cat.name}
                            </li>
                        ))}
                    </ul>
                </div>
                {mockCategories.length > 6 && (
                    <button className="btn-view-more" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? (
                            <>Thu Gọn <ChevronUp size={14} /></>
                        ) : (
                            <>Xem Thêm <ChevronDown size={14} /></>
                        )}
                    </button>
                )}
            </div>

            <div className="filter-divider"></div>

            {/* Price Filter */}
            <div className="filter-section">
                <h3 className="filter-section__title">GIÁ</h3>
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

            {/* Brand Filter */}
            <div className="filter-section">
                <h3 className="filter-section__title">THƯƠNG HIỆU</h3>
                <label className="filter-checkbox-item">
                    <input type="checkbox" />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-label">OEM</span>
                </label>
            </div>

            <div className="filter-divider"></div>

            {/* Supplier Filter */}
            <div className="filter-section">
                <h3 className="filter-section__title">NHÀ CUNG CẤP</h3>
                <div className="filter-checkbox-list">
                    {['Đông A', 'Huy Hoang Bookstore', 'Nhà Sách Minh Thắng', 'Cty Văn Hóa & Truyền Thông Trí Việt'].map((sup) => (
                        <label key={sup} className="filter-checkbox-item">
                            <input type="checkbox" />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">{sup}</span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;
