import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { ValidationConfig } from '../handlers/student-validation-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { BestSemesterSelectionConfig } from '../handlers/best-semester-selection-handler';
import { BestSemesterAverageFinalScoreConfig } from '../handlers/best-semester-average-final-score-handler';
import { ZScoreGradeConfig } from '../handlers/zscore-grade-conversion-handler';
import { PercentileGradeConfig } from '../handlers/percentile-grade-conversion-handler';

export class SeoilConfig {
    private static readonly ADMISSION_CODES = {
        학생부위주: '61',
        실기면접위주1: '11',
        실기면접위주2: '62',
    } as const;

    private static readonly UNIT_CODES: Record<string, string> = {
        모집01: '01',
        모집02: '02',
        모집03: '03',
        모집04: '04',
        모집05: '05',
        모집06: '06',
        모집07: '07',
        모집08: '08',
        모집09: '09',
        모집10: '10',
        모집11: '11',
        모집12: '12',
        모집13: '13',
        모집14: '14',
        모집15: '15',
        모집16: '16',
        모집17: '17',
        모집18: '18',
        모집19: '19',
        모집20: '20',
        모집21: '21',
        모집22: '22',
        모집23: '23',
        모집24: '24',
        모집25: '25',
        모집27: '27',
        모집29: '29',
        모집31: '31',
        모집32: '32',
        모집36: '36',
        모집37: '37',
        모집38: '38',
        모집39: '39',
        모집40: '40',
        모집41: '41',
        모집42: '42',
        모집44: '44',
        모집45: '45',
        모집46: '46',
        모집48: '48',
        모집49: '49',
        모집51: '51',
        모집52: '52',
        모집55: '55',
        모집58: '58',
        모집59: '59',
        모집62: '62',
        모집63: '63',
        모집64: '64',
        모집65: '65',
        모집67: '67',
        모집68: '68',
        모집69: '69',
        모집71: '71',
        모집74: '74',
        모집75: '75',
        모집76: '76',
        모집77: '77',
        모집78: '78',
        모집79: '79',
        모집80: '80',
    } as const;

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '61': '학생부위주',
        '11': '실기/면접위주 1',
        '62': '실기/면접위주 2',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        ALL: '전체',
    };

    static readonly SUBJECT_SEPARATION_CODE_TO_NAME: Record<string, string> = {
        '01': '공통과목',
        '03': '일반선택',
    };

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = Object.values(SeoilConfig.ADMISSION_CODES);

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(SeoilConfig.UNIT_CODES);

    readonly validationConfig: ValidationConfig = {
        admissions: [...SeoilConfig.ALL_ADMISSIONS],
        units: [...SeoilConfig.ALL_UNITS],
    };

    // 반영 학기 설정: 3학년 2학기 제외
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...SeoilConfig.ALL_ADMISSIONS],
            units: [...SeoilConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1, // 졸업 예정자: 3-1까지
            excludeEarlyGraduateSecondGradeSecondTerm: true, // 조기 졸업(예정)자: 2-1까지
            isNotAppliedForGraduate: false, // 졸업자: 3-2까지 (별도 처리)
        },
    ];

    // 석차등급 -> 점수 변환 (2008년 이후 졸업자)
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...SeoilConfig.ALL_ADMISSIONS],
            units: [...SeoilConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'], // 공통, 일반선택
            gradeMapping: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
                9: 9,
            },
        },
    ];

    // 2008년 이전 졸업자: 과목 석차에 의한 환산 등급
    readonly percentileGradeConfig: PercentileGradeConfig[] = [
        {
            admissions: [...SeoilConfig.ALL_ADMISSIONS],
            units: [...SeoilConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'], // 공통, 일반선택
            graduateYearThreshold: 2008, // 2008년 이전 졸업자에게만 적용
            gradeScoreMapping: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
                9: 9,
            },
            isNotReflectedForSameRank: true,
        },
    ];

    // Z점수 -> 등급 변환 (석차가 존재하지 않는 경우)
    readonly zScoreGradeConfig: ZScoreGradeConfig[] = [
        {
            admissions: [...SeoilConfig.ALL_ADMISSIONS],
            units: [...SeoilConfig.ALL_UNITS],
            subjectSeparations: ['01', '02', '03'],
            gradeMapping: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
                9: 9,
            },
            zScoreRoundDigits: 2,
            zScoreGradeMapping: {
                1: 1.76,
                2: 1.23,
                3: 0.74,
                4: 0.26,
                5: -0.25,
                6: -0.73,
                7: -1.22,
                8: -1.75,
            },
            notOnlyForSpecialSubject: true,
            excludeISU: true,
        },
    ];

    // 우수 2개 학기 선택
    readonly bestSemesterSelectionConfig: BestSemesterSelectionConfig[] = [
        {
            admissions: [...SeoilConfig.ALL_ADMISSIONS],
            units: [...SeoilConfig.ALL_UNITS],
            bestSemesterCount: 2,
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...SeoilConfig.ALL_ADMISSIONS],
            units: [...SeoilConfig.ALL_UNITS],
        },
    ];

    // 학기별 평균 계산 및 최종 점수 산출
    // 실기/면접위주 1: 최고점 200, 최저점 144
    // 실기/면접위주 2: 최고점 400, 최저점 288
    // 학생부 위주: 최고점 1000, 최저점 720
    // 총점수 = 최저점 + ((9-내신등급) / 8 × (최고점 - 최저점))
    readonly bestSemesterAverageFinalScoreConfig: BestSemesterAverageFinalScoreConfig[] = [
        {
            admissions: [SeoilConfig.ADMISSION_CODES.실기면접위주1],
            units: [...SeoilConfig.ALL_UNITS],
            formula: (averageGrade: number) => 144 + ((9 - averageGrade) / 8) * (200 - 144),
            roundDigits: 3, // 소수점 넷째자리에서 반올림
        },
        {
            admissions: [SeoilConfig.ADMISSION_CODES.실기면접위주2],
            units: [...SeoilConfig.ALL_UNITS],
            formula: (averageGrade: number) => 288 + ((9 - averageGrade) / 8) * (400 - 288),
            roundDigits: 3, // 소수점 넷째자리에서 반올림
        },
        {
            admissions: [SeoilConfig.ADMISSION_CODES.학생부위주],
            units: [...SeoilConfig.ALL_UNITS],
            formula: (averageGrade: number) => 720 + ((9 - averageGrade) / 8) * (1000 - 720),
            roundDigits: 3, // 소수점 넷째자리에서 반올림
        },
    ];
}
