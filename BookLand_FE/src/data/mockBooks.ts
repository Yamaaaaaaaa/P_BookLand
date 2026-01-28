import type { Book } from '../types/Book';
import { BookStatus } from '../types/Book';
import { mockAuthors, mockCategories, mockPublishers, mockSeries } from './mockMasterData';
import { mockUsers } from './mockUsers';

const admin = mockUsers[0];

export const mockBooks: Book[] = [
    {
        id: 1,
        name: 'The Great Gatsby',
        description: 'A classic novel.',
        originalCost: 200000,
        sale: 0,
        stock: 50,
        status: BookStatus.ENABLE,
        publishedDate: '1925-04-10',
        bookImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg',
        pin: true,
        author: mockAuthors[0], // JK Rowling placehold (using what we have)
        publisher: mockPublishers[0],
        series: undefined,
        creator: admin,
        categories: [mockCategories[0]], // Fiction
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-10T10:00:00Z'
    },
    {
        id: 2,
        name: 'Clean Code',
        description: 'A Handbook of Agile Software Craftsmanship.',
        originalCost: 500000,
        sale: 10, // 10% off? or 10 value? Usually percentage or amount. Assuming percent or amount. Type is number.
        stock: 20,
        status: BookStatus.ENABLE,
        publishedDate: '2008-08-01',
        bookImageUrl: 'https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg',
        pin: false,
        author: mockAuthors[2], // Uncle Bob
        publisher: mockPublishers[2], // Prentice Hall
        series: mockSeries[2], // Clean Code Collection
        creator: admin,
        categories: [mockCategories[2], mockCategories[4]], // Business, Tech
        createdAt: '2023-01-05T10:00:00Z'
    },
    {
        id: 3,
        name: 'Harry Potter and the Sorcerer\'s Stone',
        description: 'First book in the Harry Potter series.',
        originalCost: 150000,
        sale: 0,
        stock: 100,
        status: BookStatus.ENABLE,
        publishedDate: '1997-06-26',
        bookImageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6b/Harry_Potter_and_the_Philosopher%27s_Stone_Book_Cover.jpg',
        pin: true,
        author: mockAuthors[0],
        publisher: mockPublishers[0],
        series: mockSeries[0],
        creator: admin,
        categories: [mockCategories[0], mockCategories[5]], // Fiction, Children
        createdAt: '2023-02-01T10:00:00Z'
    },
    {
        id: 4,
        name: 'Game of Thrones',
        description: 'First book of A Song of Ice and Fire.',
        originalCost: 180000,
        sale: 5,
        stock: 40,
        status: BookStatus.ENABLE,
        publishedDate: '1996-08-06',
        bookImageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/93/AGameOfThrones.jpg',
        pin: false,
        author: mockAuthors[1],
        publisher: mockPublishers[1],
        series: mockSeries[1],
        creator: admin,
        categories: [mockCategories[0], mockCategories[1]], // Fiction, SciFi
        createdAt: '2023-02-05T10:00:00Z'
    },
    {
        id: 5,
        name: 'Introduction to Algorithms',
        description: 'Comprehensive textbook on algorithms.',
        originalCost: 800000,
        sale: 0,
        stock: 10,
        status: BookStatus.ENABLE,
        publishedDate: '2009-07-31',
        bookImageUrl: 'https://m.media-amazon.com/images/I/41T0iTbWJEL._SX218_BO1,204,203,200_QL40_FMwebp_.jpg',
        pin: false,
        author: mockAuthors[3], // Asimov (wrong author but using mock data valid ref)
        publisher: mockPublishers[3], // OReilly
        series: undefined,
        creator: admin,
        categories: [mockCategories[4]], // Tech
        createdAt: '2023-03-01T10:00:00Z'
    }
];

export const allBooks = mockBooks;
export const featuredBooks = mockBooks.filter(b => b.pin);
export const offerBooks = mockBooks.filter(b => b.sale > 0);

export const getBookById = (id: string | number) => {
    return mockBooks.find(b => b.id === Number(id));
};

export const getRelatedBooks = (book: Book) => {
    return mockBooks.filter(b => 
        b.id !== book.id && 
        (b.author.id === book.author.id || 
         b.categories?.some(c => book.categories?.some(bc => bc.id === c.id)))
    ).slice(0, 4);
};

export const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'under-100k', label: 'Under 100.000 VND', min: 0, max: 100000 },
    { value: '100k-500k', label: '100.000 - 500.000 VND', min: 100000, max: 500000 },
    { value: 'over-500k', label: 'Over 500.000 VND', min: 500000, max: 10000000 }
];

export const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' }
];

export const bookCategories = ['All', ...mockCategories.map(c => c.name)];
