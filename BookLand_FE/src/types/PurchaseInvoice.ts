import type { User } from ".";
import type { PurchaseInvoiceBook } from "./PurchaseInvoiceBook";
import type { Supplier } from "./Supplier";


export const PurchaseStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED'
} as const;

export type PurchaseStatus = (typeof PurchaseStatus)[keyof typeof PurchaseStatus];

export interface PurchaseInvoice {
    id: number;
    supplier: Supplier;
    creator: User;
    totalCost: number;
    status: PurchaseStatus;
    createdAt?: string;
    updatedAt?: string;
    purchaseInvoiceBooks?: PurchaseInvoiceBook[];
}
