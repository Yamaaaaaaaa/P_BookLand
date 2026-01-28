import type { Book } from './Book';

export interface Serie {
    id: number;
    name: string;
    description?: string;
    books?: Book[];
}
