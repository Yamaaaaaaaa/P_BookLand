import { useState, useMemo } from 'react';
import BookGrid from '../../components/BooksGrid';
import { allBooks, priceRanges } from '../../data/mockBooks';
import '../../styles/shop.css';
import FilterSidebar from '../../components/FilterSidebar';
import SearchBar from '../../components/SearchBar';

const BooksPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPriceRange, setSelectedPriceRange] = useState('all');
    const [selectedSort, setSelectedSort] = useState('default');

    const filteredBooks = useMemo(() => {
        let result = [...allBooks];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (book) =>
                    book.name.toLowerCase().includes(query) ||
                    book.author.name.toLowerCase().includes(query)
            );
        }

        // Filter by category
        if (selectedCategory !== 'All') {
            result = result.filter((book) => book.categories?.[0]?.name === selectedCategory);
        }

        // Filter by price range
        const priceRange = priceRanges.find((r) => r.value === selectedPriceRange);
        if (priceRange && selectedPriceRange !== 'all' && priceRange.min !== undefined && priceRange.max !== undefined) {
            result = result.filter(
                (book) => book.originalCost >= priceRange.min! && book.originalCost <= priceRange.max!
            );
        }

        // Sort
        switch (selectedSort) {
            case 'price-low':
                result.sort((a, b) => a.originalCost - b.originalCost);
                break;
            case 'price-high':
                result.sort((a, b) => b.originalCost - a.originalCost);
                break;
            case 'rating':
                // result.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                // result.sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0));
                break;
            default:
                break;
        }

        return result;
    }, [searchQuery, selectedCategory, selectedPriceRange, selectedSort]);

    return (
        <div className="books-page">
            <div className="shop-container">
                {/* Page Header */}
                <div className="books-page__header">
                    <div className="books-page__title-section">
                        <h1 className="books-page__title">All Books</h1>
                        <p className="books-page__count">{filteredBooks.length} books found</p>
                    </div>
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>

                {/* Main Content */}
                <div className="books-page__content">
                    <FilterSidebar
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedPriceRange={selectedPriceRange}
                        onPriceRangeChange={setSelectedPriceRange}
                        selectedSort={selectedSort}
                        onSortChange={setSelectedSort}
                    />
                    <div className="books-page__grid">
                        <BookGrid books={filteredBooks} columns={3} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BooksPage;
