

export const BookStatus = {
    ENABLE: 'ENABLE',
    DISABLE: 'DISABLE'
} as const;

export type BookStatus = (typeof BookStatus)[keyof typeof BookStatus];

export interface Book {
    id: number;
    name: string;
    description?: string;
    originalCost: number;
    sale: number;
    finalPrice: number;
    stock: number;
    status: BookStatus;
    publishedDate?: string;
    bookImageUrl?: string;
    pin: boolean;
    authorId: number;
    authorName: string;
    publisherId: number;
    publisherName: string;
    seriesId?: number;
    seriesName?: string;
    categoryIds: number[];
    createdAt?: string;
    updatedAt?: string;
}

export interface BookRequest {
    name: string;
    description?: string;
    originalCost: number;
    sale: number;
    stock: number;
    status: BookStatus;
    publishedDate?: string;
    bookImageUrl?: string;
    pin: boolean;
    authorId: number;
    publisherId: number;
    seriesId?: number;
    categoryIds: number[];
}
