export const CalculatorEnum = {
    GACHEON: 'GACHEON',
    GYEONGBOK: 'GYEONGBOK',
    KYUNGHEE: 'KYUNGHEE',
    KONKUK: 'KONKUK',
    DANKOOK: 'DANKOOK',
    DEOKSUNG: 'DEOKSUNG',
    MYONGJI: 'MYONGJI',
    PUSAN: 'PUSAN',
    SAMYOOK: 'SAMYOOK',
    SAMYOOK_HEALTH: 'SAMYOOK_HEALTH',
    SEOULTECH: 'SEOULTECH',
    SEOIL: 'SEOIL',
    SUNGKYUL: 'SUNGKYUL',
    SEONGGONGHOUI: 'SEONGGONGHOUI',
    SUNGSIL: 'SUNGSIL',
    SOONGUI: 'SOONGUI',
    SHINHAN: 'SHINHAN',
    YONSEI: 'YONSEI',
    YUHAN: 'YUHAN',
} as const;

export type CalculatorEnum = (typeof CalculatorEnum)[keyof typeof CalculatorEnum];
