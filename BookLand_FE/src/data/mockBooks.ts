export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: 'sale' | 'new';
}

export const featuredBooks: Book[] = [
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
  }
];

export const offerBooks: Book[] = [
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
  }
];

export const heroBook = {
  id: 'hero',
  title: 'Life Of The Wild',
  author: 'Laura Ingalls Wilder',
  description: 'Lorem dolor sit amet, consectetur adipiscing elit. Sed eu feugiat amet, libero ipsum enim pharetra hac. Urna commodo, lacus ut magna velit eleifend. Amet, quis urna, a eu.',
  image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
};
