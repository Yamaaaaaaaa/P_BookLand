export const EventRuleType = {
    MIN_ORDER_VALUE: 'MIN_ORDER_VALUE',
    MAX_ORDER_VALUE: 'MAX_ORDER_VALUE',
    MIN_QUANTITY: 'MIN_QUANTITY',
    MAX_QUANTITY: 'MAX_QUANTITY'
} as const;

export type EventRuleType = (typeof EventRuleType)[keyof typeof EventRuleType];
