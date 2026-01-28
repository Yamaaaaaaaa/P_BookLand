export interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  slug: string;
}

export const articles: Article[] = [
  {
    id: '1',
    title: 'Books Always Makes The Person Happy',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu feugiat amet, libero ipsum enim pharetra hac.',
    date: '15 Dec 2023',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    slug: 'books-makes-happy'
  },
  {
    id: '2',
    title: 'Reading Books Always Makes The Moments Happy',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu feugiat amet, libero ipsum enim pharetra hac.',
    date: '12 Dec 2023',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    slug: 'reading-moments'
  },
  {
    id: '3',
    title: 'Reading Books Always Makes The Moments Happy',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu feugiat amet, libero ipsum enim pharetra hac.',
    date: '10 Dec 2023',
    image: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=400&h=300&fit=crop',
    slug: 'happy-reading'
  }
];
