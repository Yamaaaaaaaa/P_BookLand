import type { User } from './User.ts';
import type { Permission } from './Permission.ts';

export interface Role {
    id: number;
    name: string;
    description?: string;
    users?: User[];
    permissions?: Permission[];
}
