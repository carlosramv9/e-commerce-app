export interface AppliedCoupon {
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    value: number;
    maxDiscount?: number;
}
