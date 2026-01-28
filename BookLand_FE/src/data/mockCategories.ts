import { BookOpen, Library, Book, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  slug: string;
}

export const categories: Category[] = [
  {
    id: '1',
    label: 'Bookstore',
    icon: BookOpen,
    slug: 'bookstore'
  },
  {
    id: '2',
    label: 'Bookshop',
    icon: Book,
    slug: 'bookshop'
  },
  {
    id: '3',
    label: 'Library',
    icon: Library,
    slug: 'library'
  },
  {
    id: '4',
    label: 'Flipside',
    icon: FileText,
    slug: 'flipside'
  }
];
