import type { User } from './User.ts';

export const NotificationStatus = {
    UNREAD: 'UNREAD',
    READ: 'READ',
    ARCHIVED: 'ARCHIVED'
} as const;

export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export interface Notification {
    id: number;
    from?: User;
    to: User;
    type: string;
    title: string;
    content?: string;
    status: NotificationStatus;
    readAt?: string;
    createdAt?: string;
}
