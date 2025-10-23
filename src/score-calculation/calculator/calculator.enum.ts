export const CalculatorEnum = {
    GACHEON: 'GACHEON',
    GYEONGBOK: 'GYEONGBOK',
    KYUNGHEE: 'KYUNGHEE',
    KONKUK: 'KONKUK',
    DANKOOK: 'DANKOOK',
    DEOKSUNG: 'DEOKSUNG',
} as const;

export type CalculatorEnum = (typeof CalculatorEnum)[keyof typeof CalculatorEnum];
