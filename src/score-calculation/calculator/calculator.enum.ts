export const CalculatorEnum = {
    GACHEON: 'GACHEON',
} as const;

export type CalculatorEnum = (typeof CalculatorEnum)[keyof typeof CalculatorEnum];
