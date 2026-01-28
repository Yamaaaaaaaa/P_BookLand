import type { Role } from '../types/Role';
import type { Category } from '../types/Category';
import type { Author } from '../types/Author';
import type { Publisher } from '../types/Publisher';
import type { Serie } from '../types/Serie';
import type { PaymentMethod } from '../types/PaymentMethod';
import type { ShippingMethod } from '../types/ShippingMethod';


// --- ROLES ---
export const mockRoles: Role[] = [
    { id: 1, name: 'ADMIN', description: 'Administrator with full access' },
    { id: 2, name: 'STAFF', description: 'Staff member with limited access' },
    { id: 3, name: 'CUSTOMER', description: 'Regular customer' },
];

// --- CATEGORIES ---
export const mockCategories: Category[] = [
    { id: 1, name: 'Fiction', description: 'Fictional literature' },
    { id: 2, name: 'Science Fiction', description: 'Sci-Fi and Fantasy' },
    { id: 3, name: 'Business', description: 'Business and Economics' },
    { id: 4, name: 'History', description: 'Historical accounts' },
    { id: 5, name: 'Technology', description: 'Computer Science and Tech' },
    { id: 6, name: 'Children', description: 'Books for kids' },
    { id: 7, name: 'Biography', description: 'Biographies and Memoirs' },
    { id: 8, name: 'Self-Help', description: 'Personal Development' }
];

// --- AUTHORS ---
export const mockAuthors: Author[] = [
    { id: 1, name: 'J.K. Rowling', description: 'British author, best known for the Harry Potter series.', authorImage: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/J._K._Rowling_2010.jpg' },
    { id: 2, name: 'George R.R. Martin', description: 'American novelist and short-story writer.', authorImage: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Portrait_photoshoot_at_Worldcon_75%2C_Helsinki%2C_before_the_Hugo_Awards_%E2%80%93_George_R._R._Martin.jpg' },
    { id: 3, name: 'Robert C. Martin', description: 'Uncle Bob, author of Clean Code.', authorImage: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Robert_Cecil_Martin.png' },
    { id: 4, name: 'Isaac Asimov', description: 'Prolific writer of science fiction.', authorImage: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Isaac.Asimov01.jpg' }
];

// --- PUBLISHERS ---
export const mockPublishers: Publisher[] = [
    { id: 1, name: 'Bloomsbury', description: 'British publishing house.' },
    { id: 2, name: 'Bantam Books', description: 'American publishing house.' },
    { id: 3, name: 'Prentice Hall', description: 'Educational publisher.' },
    { id: 4, name: 'O\'Reilly Media', description: 'American learning company.' }
];

// --- SERIES ---
export const mockSeries: Serie[] = [
    { id: 1, name: 'Harry Potter', description: 'The famous wizarding world series.' },
    { id: 2, name: 'A Song of Ice and Fire', description: 'Epic fantasy series.' },
    { id: 3, name: 'Clean Code Collection', description: 'Software engineering best practices.' }
];

// --- PAYMENT METHODS ---
export const mockPaymentMethods: PaymentMethod[] = [
    { id: 1, name: 'Cash On Delivery', providerCode: 'COD', isOnline: false, description: 'Pay when you receive' },
    { id: 2, name: 'VNPay', providerCode: 'VNPAY', isOnline: true, description: 'Online payment via VNPay' }
];

// --- SHIPPING METHODS ---
export const mockShippingMethods: ShippingMethod[] = [
    { id: 1, name: 'Standard Shipping', price: 15000, description: '3-5 business days' },
    { id: 2, name: 'Express Shipping', price: 35000, description: '1-2 business days' }
];
