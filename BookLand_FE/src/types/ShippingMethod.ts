import type { Bill } from './Bill';

export interface ShippingMethod {
    id: number;
    name: string;
    description?: string;
    price: number;
    bills?: Bill[];
}
