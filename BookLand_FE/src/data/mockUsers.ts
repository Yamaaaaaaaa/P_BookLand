import type { User } from '../types/User';
import { UserStatus } from '../types/User';
import { mockRoles } from './mockMasterData';
import type { Address } from '../types/Address';

const adminRole = mockRoles.find(r => r.name === 'ADMIN') || mockRoles[0];
const customerRole = mockRoles.find(r => r.name === 'CUSTOMER') || mockRoles[2];

export const mockUsers: User[] = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@bookland.com',
        firstName: 'System',
        lastName: 'Admin',
        status: UserStatus.ENABLE,
        roles: [adminRole]
    },
    {
        id: 2,
        username: 'customer1',
        email: 'customer@test.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '0987654321',
        status: UserStatus.ENABLE,
        roles: [customerRole]
    }
];

// Need to link addresses to users.
// Since User interface has addresses[] and Address has user, it's circular.
// In mock data, we usually just define one side or use partials, but Typescript might complain.
// Let's create addresses first, then assign.

export const mockAddresses: Address[] = [
    {
        id: 1,
        user: mockUsers[1], // customer1
        contactPhone: '0987654321',
        addressDetail: '123 Main St, Hanoi',
        isDefault: true
    },
    {
        id: 2,
        user: mockUsers[1], // customer1
        contactPhone: '0987654322',
        addressDetail: '456 Side St, Danang',
        isDefault: false
    }
];

// bi-directional assignment
mockUsers[1].addresses = mockAddresses;
