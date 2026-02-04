import { useState, useMemo } from 'react';
import { ChevronRight, Grid, List, Filter as FilterIcon } from 'lucide-react';
import BookGrid from '../../components/BooksGrid';
import { allBooks } from '../../data/mockBooks';
import '../../styles/pages/books.css';
import '../../styles/components/book-card.css';
import FilterSidebar from '../../components/FilterSidebar';

const BooksPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [selectedSort, setSelectedSort] = useState('default');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredBooks = useMemo(() => {
        let result = [...allBooks];

        // Filter by category (ID)
        if (selectedCategory !== 'All') {
            result = result.filter((book) =>
                book.categoryIds?.map(String).includes(selectedCategory)
            );
        }

        // Filter by price range
        if (selectedPriceRange) {
            if (selectedPriceRange === '700000-up') {
                result = result.filter(book => book.finalPrice >= 700000);
            } else {
                const [min, max] = selectedPriceRange.split('-').map(Number);
                result = result.filter(book => book.finalPrice >= min && book.finalPrice <= max);
            }
        }

        // Sort
        switch (selectedSort) {
            case 'price-low':
                result.sort((a, b) => a.finalPrice - b.finalPrice);
                break;
            case 'price-high':
                result.sort((a, b) => b.finalPrice - a.finalPrice);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
                break;
            default:
                break;
        }

        return result;
    }, [selectedCategory, selectedPriceRange, selectedSort]);

    return (
        <div className="books-page">
            <div className="shop-container">
                {/* Breadcrumbs */}
                <div className="breadcrumb">
                    <span>Trang chủ</span>
                    <ChevronRight size={14} />
                    <span>Sách tiếng Việt</span>
                    <ChevronRight size={14} />
                    <span>Văn học</span>
                    <ChevronRight size={14} />
                    <span className="current">Tác phẩm kinh điển</span>
                </div>

                <div className="books-layout">
                    {/* Sidebar */}
                    <FilterSidebar
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedPriceRange={selectedPriceRange}
                        onPriceRangeChange={setSelectedPriceRange}
                        isMobileOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />

                    {/* Main Content */}
                    <main className="books-content">
                        {/* Toolbar */}
                        <div className="books-toolbar">
                            <div className="toolbar-left">
                                <span className="sort-label">Sắp xếp theo:</span>
                                <select
                                    className="select-sort"
                                    value={selectedSort}
                                    onChange={(e) => setSelectedSort(e.target.value)}
                                >
                                    <option value="default">Bán Chạy Tuần</option>
                                    <option value="newest">Mới Nhất</option>
                                    <option value="price-low">Giá Thấp Đến Cao</option>
                                    <option value="price-high">Giá Cao Đến Thấp</option>
                                </select>
                                <select className="select-limit">
                                    <option>24 sản phẩm</option>
                                    <option>48 sản phẩm</option>
                                </select>
                            </div>
                            <div className="toolbar-right">
                                <div className="view-mode">
                                    <button
                                        className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        className={`btn-view ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                                <button className="btn-filter-mobile" onClick={() => setIsSidebarOpen(true)}>
                                    <FilterIcon size={18} />
                                    Lọc
                                </button>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="books-grid-wrapper">
                            <BookGrid books={filteredBooks} columns={4} viewMode={viewMode} />
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
        </div>
    );
};

export default BooksPage;
