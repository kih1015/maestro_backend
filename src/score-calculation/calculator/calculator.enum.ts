export const CalculatorEnum = {
    GACHEON: 'GACHEON',
    GYEONGBOK: 'GYEONGBOK',
    KYUNGHEE: 'KYUNGHEE',
    KONKUK: 'KONKUK',
    DANKOOK: 'DANKOOK',
    DEOKSUNG: 'DEOKSUNG',
    MYONGJI: 'MYONGJI',
    PUSAN: 'PUSAN',
} as const;

export type CalculatorEnum = (typeof CalculatorEnum)[keyof typeof CalculatorEnum];
