export const EventActionType = {
    DISCOUNT_PERCENT: 'DISCOUNT_PERCENT',
    DISCOUNT_AMOUNT: 'DISCOUNT_AMOUNT',
    BILL_DISCOUNT_PERCENT: 'BILL_DISCOUNT_PERCENT',
    BILL_DISCOUNT_AMOUNT: 'BILL_DISCOUNT_AMOUNT',
    FREE_SHIPPING: 'FREE_SHIPPING'
} as const;

export type EventActionType = (typeof EventActionType)[keyof typeof EventActionType];
