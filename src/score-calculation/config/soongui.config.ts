import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { ValidationConfig } from '../handlers/student-validation-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { BestSemesterSelectionConfig } from '../handlers/best-semester-selection-handler';
import { BestSemesterAverageFinalScoreConfig } from '../handlers/best-semester-average-final-score-handler';
import { ZScoreGradeConfig } from '../handlers/zscore-grade-conversion-handler';
import { PercentileGradeConfig } from '../handlers/percentile-grade-conversion-handler';

export class SoonguiConfig {
    private static readonly ADMISSION_CODES = {
        전형11: '11',
        전형12: '12',
        전형61: '61',
        전형62: '62',
        전형72: '72',
        전형74: '74',
        전형75: '75',
        전형76: '76',
        전형78: '78',
        전형80: '80',
    } as const;

    private static readonly UNIT_CODES = {
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
        '01': '전형01',
        '02': '전형02',
        '03': '전형03',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '00': '전체',
    };

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = Object.values(SoonguiConfig.ADMISSION_CODES);

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(SoonguiConfig.UNIT_CODES);

    readonly validationConfig: ValidationConfig = {
        admissions: [...SoonguiConfig.ALL_ADMISSIONS],
        units: [...SoonguiConfig.ALL_UNITS],
    };

    // 반영 학기 설정: 3학년 2학기 제외
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...SoonguiConfig.ALL_ADMISSIONS],
            units: [...SoonguiConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1, // 졸업 예정자: 3-1까지
            excludeEarlyGraduateSecondGradeSecondTerm: true, // 조기 졸업(예정)자: 2-1까지
            isNotAppliedForGraduate: false, // 졸업자: 3-2까지 (별도 처리)
        },
    ];

    // 석차등급 -> 점수 변환 (2008년 이후 졸업자)
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...SoonguiConfig.ALL_ADMISSIONS],
            units: [...SoonguiConfig.ALL_UNITS],
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

    readonly percentileGradeConfig: PercentileGradeConfig[] = [
        {
            admissions: [...SoonguiConfig.ALL_ADMISSIONS],
            units: [...SoonguiConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'], // 모든 과목
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
        },
    ];

    // Z점수 -> 등급 변환 (학생부 등급이 없는 경우)
    readonly zScoreGradeConfig: ZScoreGradeConfig[] = [
        {
            admissions: [...SoonguiConfig.ALL_ADMISSIONS],
            units: [...SoonguiConfig.ALL_UNITS],
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
            admissions: [...SoonguiConfig.ALL_ADMISSIONS],
            units: [...SoonguiConfig.ALL_UNITS],
            bestSemesterCount: 2,
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...SoonguiConfig.ALL_ADMISSIONS],
            units: [...SoonguiConfig.ALL_UNITS],
        },
    ];

    // 학기별 평균 계산 및 최종 점수 산출: 920 + (10 × (9 - 등급 비율))
    readonly bestSemesterAverageFinalScoreConfig: BestSemesterAverageFinalScoreConfig[] = [
        {
            admissions: [...SoonguiConfig.ALL_ADMISSIONS],
            units: [...SoonguiConfig.ALL_UNITS],
            formula: (averageGrade: number) => 920 + 10 * (9 - averageGrade),
            roundDigits: 3, // 소수점 넷째자리에서 반올림
        },
    ];
}
