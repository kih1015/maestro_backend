export const CalculatorEnum = {
    GACHEON: 'GACHEON',
    GYEONGBOK: 'GYEONGBOK',
} as const;

export type CalculatorEnum = (typeof CalculatorEnum)[keyof typeof CalculatorEnum];
