export const EventTargetType = {
    BOOK: 'BOOK',
    CATEGORY: 'CATEGORY',
    SERIES: 'SERIES',
    AUTHOR: 'AUTHOR',
    PUBLISHER: 'PUBLISHER',
    ALL: 'ALL'
} as const;

export type EventTargetType = (typeof EventTargetType)[keyof typeof EventTargetType];
