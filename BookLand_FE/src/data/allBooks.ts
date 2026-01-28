import type { Book } from './mockBooks';

export const allBooks: Book[] = [
  {
    id: '1',
    title: 'Simple Way Of Piece Life',
    author: 'Armor Ramsey',
    price: 40.00,
    originalPrice: 50.00,
    category: 'Lifestyle',
    rating: 4.5,
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    badge: 'sale'
  },
  {
    id: '2',
    title: 'Great Travel At Desert',
    author: 'Sonia Blackwood',
    price: 38.00,
    category: 'Adventure',
    rating: 5,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    badge: 'new'
  },
  {
    id: '3',
    title: 'The Lady Beauty',
    author: 'Emma Sullivan',
    price: 45.00,
    category: 'Romance',
    rating: 4,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop'
  },
  {
    id: '4',
    title: 'Once Upon A Time',
    author: 'Zara Ashford',
    price: 35.00,
    originalPrice: 42.00,
    category: 'Fiction',
    rating: 4.5,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=400&fit=crop',
    badge: 'sale'
  },
  {
    id: '5',
    title: 'A Happiness',
    author: 'Fabia Joana',
    price: 25.00,
    originalPrice: 35.00,
    category: 'Self-Help',
    rating: 5,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop',
    badge: 'sale'
  },
  {
    id: '6',
    title: 'Fashion Stories',
    author: 'Aria Montague',
    price: 42.00,
    category: 'Fashion',
    rating: 4,
    reviewCount: 34,
    image: 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=300&h=400&fit=crop'
  },
  {
    id: '7',
    title: 'Musical Passion',
    author: 'Leo Hartley',
    price: 38.00,
    category: 'Music',
    rating: 4.5,
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop'
  },
  {
    id: '8',
    title: 'Life Of Happiness',
    author: 'Jasper Wren',
    price: 30.00,
    originalPrice: 40.00,
    category: 'Biography',
    rating: 5,
    reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop',
    badge: 'sale'
  },
  {
    id: '9',
    title: 'The Mystery Garden',
    author: 'Clara Bennett',
    price: 32.00,
    category: 'Fiction',
    rating: 4.5,
    reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&h=400&fit=crop',
    badge: 'new'
  },
  {
    id: '10',
    title: 'Cooking Adventures',
    author: 'Marco Rossi',
    price: 28.00,
    category: 'Lifestyle',
    rating: 4,
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1490633874781-1c63cc424610?w=300&h=400&fit=crop'
  },
  {
    id: '11',
    title: 'Digital Future',
    author: 'Alex Chen',
    price: 55.00,
    originalPrice: 65.00,
    category: 'Technology',
    rating: 4.5,
    reviewCount: 134,
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=400&fit=crop',
    badge: 'sale'
  },
  {
    id: '12',
    title: 'Mountain Expedition',
    author: 'Sarah Walker',
    price: 44.00,
    category: 'Adventure',
    rating: 5,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=300&h=400&fit=crop'
  },
  {
    id: '13',
    title: 'Love In Paris',
    author: 'Marie Laurent',
    price: 36.00,
    category: 'Romance',
    rating: 4.5,
    reviewCount: 201,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    badge: 'new'
  },
  {
    id: '14',
    title: 'Ancient History',
    author: 'David Stone',
    price: 48.00,
    category: 'History',
    rating: 4,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop'
  },
  {
    id: '15',
    title: 'Mind Power',
    author: 'Dr. Helen Brooks',
    price: 29.00,
    originalPrice: 39.00,
    category: 'Self-Help',
    rating: 5,
    reviewCount: 178,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop',
    badge: 'sale'
  },
  {
    id: '16',
    title: 'Ocean Dreams',
    author: 'Peter Ocean',
    price: 33.00,
    category: 'Adventure',
    rating: 4,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop'
  }
];

export const bookCategories = [
  'All',
  'Fiction',
  'Romance',
  'Adventure',
  'Self-Help',
  'Lifestyle',
  'Biography',
  'History',
  'Technology',
  'Music',
  'Fashion'
];

export const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' }
];

export const priceRanges = [
  { value: 'all', label: 'All Prices', min: 0, max: Infinity },
  { value: '0-30', label: 'Under $30', min: 0, max: 30 },
  { value: '30-40', label: '$30 - $40', min: 30, max: 40 },
  { value: '40-50', label: '$40 - $50', min: 40, max: 50 },
  { value: '50+', label: 'Over $50', min: 50, max: Infinity }
];

export const getBookById = (id: string): Book | undefined => {
  return allBooks.find(book => book.id === id);
};

export const getRelatedBooks = (book: Book, limit: number = 4): Book[] => {
  return allBooks
    .filter(b => b.id !== book.id && b.category === book.category)
    .slice(0, limit);
};
