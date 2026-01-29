import { bookCategories, priceRanges, sortOptions } from '../data/mockBooks';
import '../styles/pages/books.css';

interface FilterSidebarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    selectedPriceRange: string;
    onPriceRangeChange: (range: string) => void;
    selectedSort: string;
    onSortChange: (sort: string) => void;
}

const FilterSidebar = ({
    selectedCategory,
    onCategoryChange,
    selectedPriceRange,
    onPriceRangeChange,
    selectedSort,
    onSortChange
}: FilterSidebarProps) => {
    return (
        <aside className="filter-sidebar">
            {/* Sort By */}
            <div className="filter-section">
                <h3 className="filter-section__title">Sort By</h3>
                <select
                    value={selectedSort}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="filter-select"
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Categories */}
            <div className="filter-section">
                <h3 className="filter-section__title">Categories</h3>
                <ul className="filter-list">
                    {bookCategories.map((category) => (
                        <li key={category}>
                            <button
                                className={`filter-list__item ${selectedCategory === category ? 'filter-list__item--active' : ''}`}
                                onClick={() => onCategoryChange(category)}
                            >
                                {category}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Range */}
            <div className="filter-section">
                <h3 className="filter-section__title">Price Range</h3>
                <ul className="filter-list">
                    {priceRanges.map((range) => (
                        <li key={range.value}>
                            <button
                                className={`filter-list__item ${selectedPriceRange === range.value ? 'filter-list__item--active' : ''}`}
                                onClick={() => onPriceRangeChange(range.value)}
                            >
                                {range.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default FilterSidebar;
