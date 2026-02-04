import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight, Grid, List, Filter as FilterIcon, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import BookGrid from '../../components/BooksGrid';
import bookService from '../../api/bookService';
import type { Book } from '../../types/Book';
import type { Page } from '../../types/api';
import '../../styles/pages/books.css';
import '../../styles/components/book-card.css';
import FilterSidebar from '../../components/FilterSidebar';

const BooksPage = () => {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword') || '';

    // States
    const [books, setBooks] = useState<Book[]>([]);
    const [pageData, setPageData] = useState<Page<Book> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed for API
    const [pageSize, setPageSize] = useState(12);

    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
    const [selectedPublisherIds, setSelectedPublisherIds] = useState<number[]>([]);
    const [selectedSeriesIds, setSelectedSeriesIds] = useState<number[]>([]);

    const [selectedSort, setSelectedSort] = useState('default');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const fetchBooks = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: currentPage,
                size: pageSize,
                keyword: keyword || undefined,
            };

            // Category
            if (selectedCategoryIds.length > 0) {
                params.categoryIds = selectedCategoryIds;
            }

            // Price Range
            if (selectedPriceRange) {
                if (selectedPriceRange === '700000-up') {
                    params.minPrice = 700000;
                } else {
                    const [min, max] = selectedPriceRange.split('-').map(Number);
                    params.minPrice = min;
                    params.maxPrice = max;
                }
            }

            // Other Filters
            if (selectedAuthorIds.length > 0) params.authorIds = selectedAuthorIds;
            if (selectedPublisherIds.length > 0) params.publisherIds = selectedPublisherIds;
            if (selectedSeriesIds.length > 0) params.seriesIds = selectedSeriesIds;

            // Sorting
            switch (selectedSort) {
                case 'price-low':
                    params.sortBy = 'originalCost';
                    params.sortDirection = 'ASC';
                    break;
                case 'price-high':
                    params.sortBy = 'originalCost';
                    params.sortDirection = 'DESC';
                    break;
                case 'newest':
                    params.sortBy = 'createdAt';
                    params.sortDirection = 'DESC';
                    break;
                default:
                    // Default could be by sales or pin
                    break;
            }

            const response = await bookService.getAllBooks(params);
            if (response.result) {
                setBooks(response.result.content);
                setPageData(response.result);
            }
        } catch (error) {
            console.error('Failed to fetch books:', error);
        } finally {
            setIsLoading(false);
        }
    }, [keyword, selectedCategoryIds, selectedPriceRange, selectedAuthorIds, selectedPublisherIds, selectedSeriesIds, selectedSort, currentPage, pageSize]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // Reset to page 0 when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [keyword, selectedCategoryIds, selectedPriceRange, selectedAuthorIds, selectedPublisherIds, selectedSeriesIds, selectedSort]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < (pageData?.totalPages || 0)) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Toggle handlers for multi-select filters
    const handleToggle = (id: number, currentIds: number[], setter: (ids: number[]) => void) => {
        if (currentIds.includes(id)) {
            setter(currentIds.filter(item => item !== id));
        } else {
            setter([...currentIds, id]);
        }
    };

    const handleClearAllFilters = () => {
        setSelectedCategoryIds([]);
        setSelectedAuthorIds([]);
        setSelectedPublisherIds([]);
        setSelectedSeriesIds([]);
        setSelectedPriceRange('');
    };

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
                        selectedCategoryIds={selectedCategoryIds}
                        onCategoryToggle={(id: number) => handleToggle(id, selectedCategoryIds, setSelectedCategoryIds)}
                        onCategoryClear={() => setSelectedCategoryIds([])}
                        selectedPriceRange={selectedPriceRange}
                        onPriceRangeChange={setSelectedPriceRange}
                        selectedAuthorIds={selectedAuthorIds}
                        onAuthorToggle={(id: number) => handleToggle(id, selectedAuthorIds, setSelectedAuthorIds)}
                        onAuthorClear={() => setSelectedAuthorIds([])}
                        selectedPublisherIds={selectedPublisherIds}
                        onPublisherToggle={(id: number) => handleToggle(id, selectedPublisherIds, setSelectedPublisherIds)}
                        onPublisherClear={() => setSelectedPublisherIds([])}
                        selectedSeriesIds={selectedSeriesIds}
                        onSeriesToggle={(id: number) => handleToggle(id, selectedSeriesIds, setSelectedSeriesIds)}
                        onSeriesClear={() => setSelectedSeriesIds([])}
                        onClearAll={handleClearAllFilters}
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
                                    <option value="default">Mặc định</option>
                                    <option value="newest">Mới Nhất</option>
                                    <option value="price-low">Giá Thấp Đến Cao</option>
                                    <option value="price-high">Giá Cao Đến Thấp</option>
                                </select>
                                <select
                                    className="select-limit"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                >
                                    <option value={12}>12 sản phẩm</option>
                                    <option value={24}>24 sản phẩm</option>
                                    <option value={48}>48 sản phẩm</option>
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

                        {/* Keyword Badge */}
                        {keyword && (
                            <div className="search-keyword-banner">
                                Kết quả tìm kiếm cho: <strong>"{keyword}"</strong>
                            </div>
                        )}

                        {/* Grid */}
                        <div className="books-grid-wrapper">
                            {isLoading ? (
                                <div className="loading-state">
                                    <div className="loader"></div>
                                    <p>Đang tải dữ liệu...</p>
                                </div>
                            ) : books.length > 0 ? (
                                <BookGrid books={books} columns={4} viewMode={viewMode} />
                            ) : (
                                <div className="empty-state">
                                    <img src="/empty-books.png" alt="No books found" style={{ maxWidth: '200px', opacity: 0.5 }} />
                                    <p>Không tìm thấy sản phẩm nào khớp với lựa chọn của bạn.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {!isLoading && pageData && pageData.totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    disabled={pageData.first}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {Array.from({ length: pageData.totalPages }, (_, i) => {
                                    // Show first, last, and current with surrounding
                                    if (
                                        i === 0 ||
                                        i === pageData.totalPages - 1 ||
                                        (i >= currentPage - 1 && i <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={i}
                                                className={`pagination-number ${currentPage === i ? 'active' : ''}`}
                                                onClick={() => handlePageChange(i)}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    } else if (i === 1 || i === pageData.totalPages - 2) {
                                        return <span key={i} className="pagination-ellipsis">...</span>;
                                    }
                                    return null;
                                })}

                                <button
                                    className="pagination-btn"
                                    disabled={pageData.last}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    <ChevronRightIcon size={18} />
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
        </div>
    );
};

export default BooksPage;
