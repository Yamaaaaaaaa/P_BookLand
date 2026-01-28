import type { User } from './User.ts';
import type { PaymentMethod } from './PaymentMethod.ts';
import type { ShippingMethod } from './ShippingMethod.ts';
import type { BillBook } from './BillBook.ts';
import type { PaymentTransaction } from './PaymentTransaction.ts';
import type { EventLog } from './EventLog.ts';

export const BillStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    SHIPPING: 'SHIPPING',
    SHIPPED: 'SHIPPED',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED'
} as const;

export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus];

export interface Bill {
    id: number;
    user: User;
    paymentMethod: PaymentMethod;
    shippingMethod: ShippingMethod;
    totalCost: number;
    approvedBy?: User;
    status: BillStatus;
    createdAt?: string;
    updatedAt?: string;
    approvedAt?: string;
    billBooks?: BillBook[];
    transactions?: PaymentTransaction[];
    eventLogs?: EventLog[];
}
