import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { ValidationConfig } from '../handlers/student-validation-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { SubjectGroupTopCourseSelectionConfig } from '../handlers/subject-group-top-course-selection-handler';
import { AverageGradeCalculationConfig } from '../handlers/average-grade-calculation-handler';
import { SeonggonghouiFinalScoreConfig } from '../handlers/seonggonghoui-final-score-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';
import { BaseScoreSumConfig } from '../handlers/base-score-sum-handler';

export class SeonggonghouiConfig {
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
        학생부교과_특성화고교: '80',
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
        '80': '학생부교과(특성화고교)',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        ALL: '전체',
    };

    static readonly SUBJECT_SEPARATION_CODE_TO_NAME: Record<string, string> = {
        '01': '공통과목',
        '03': '일반선택',
    };

    // 등급 -> 점수 변환 테이블
    static readonly GRADE_TO_SCORE_MAPPING: Record<number, number> = {
        1: 12,
        2: 10,
        3: 9,
        4: 8,
        5: 7,
        6: 6,
        7: 4,
        8: 2,
        9: 0,
    };

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = Object.values(SeonggonghouiConfig.ADMISSION_CODES);

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(SeonggonghouiConfig.UNIT_CODES);

    private static readonly STANDARD_ADMISSIONS: string[] = Object.values(SeonggonghouiConfig.ADMISSION_CODES).filter(
        code => code !== '80',
    );

    readonly validationConfig: ValidationConfig = {
        admissions: [...SeonggonghouiConfig.ALL_ADMISSIONS],
        units: [...SeonggonghouiConfig.ALL_UNITS],
    };

    // 반영 학기 설정: 3-1학기까지
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...SeonggonghouiConfig.ALL_ADMISSIONS],
            units: [...SeonggonghouiConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true,
            isNotAppliedForGraduate: false,
        },
    ];

    // 반영 교과: 국어, 수학, 영어, 사회, 과학, 한국사
    readonly subjectGroupFilterConfig: SubjectConfig[] = [
        {
            admissions: [...SeonggonghouiConfig.STANDARD_ADMISSIONS],
            units: [...SeonggonghouiConfig.ALL_UNITS],
            reflectedSubjects: ['국어', '수학', '영어', '사회', '과학', '한국사'],
        },
    ];

    // 석차등급 -> 점수 변환
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...SeonggonghouiConfig.STANDARD_ADMISSIONS],
            units: [...SeonggonghouiConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'], // 공통, 일반선택
            gradeMapping: SeonggonghouiConfig.GRADE_TO_SCORE_MAPPING,
        },
        {
            admissions: [SeonggonghouiConfig.ADMISSION_CODES.학생부교과_특성화고교],
            units: [...SeonggonghouiConfig.ALL_UNITS],
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

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...SeonggonghouiConfig.ALL_ADMISSIONS],
            units: [...SeonggonghouiConfig.ALL_UNITS],
        },
    ];

    // 교과별 상위 과목 선택
    readonly subjectGroupTopCourseSelectionConfig: SubjectGroupTopCourseSelectionConfig[] = [
        {
            admissions: [...SeonggonghouiConfig.STANDARD_ADMISSIONS],
            units: [...SeonggonghouiConfig.ALL_UNITS],
            subjectSeparations: ['01', '02', '03'],
            subjectGroupRules: [
                {
                    subjectGroups: ['국어', '수학'],
                    topCourseCount: 3,
                    groupName: '국어 또는 수학',
                },
                {
                    subjectGroups: ['영어'],
                    topCourseCount: 2,
                    groupName: '영어',
                },
                {
                    subjectGroups: ['사회', '과학', '한국사'],
                    topCourseCount: 3,
                    groupName: '사회 또는 과학 또는 한국사',
                },
            ],
        },
    ];

    // 기본 점수 + 점수 합산 (스탠다드 전형)
    readonly baseScoreSumConfig: BaseScoreSumConfig[] = [
        {
            admissions: [...SeonggonghouiConfig.STANDARD_ADMISSIONS],
            units: [...SeonggonghouiConfig.ALL_UNITS],
            baseScore: 404,
        },
    ];

    // 평균 등급 계산 (특성화고교 전형)
    readonly averageGradeCalculationConfig: AverageGradeCalculationConfig[] = [
        {
            admissions: [SeonggonghouiConfig.ADMISSION_CODES.학생부교과_특성화고교],
            units: [...SeonggonghouiConfig.ALL_UNITS],
        },
    ];

    // 최종 점수 계산: 300 + (9 - 평균등급) / 8 * 200 (특성화고교 전형)
    readonly finalScoreConfig: SeonggonghouiFinalScoreConfig[] = [
        {
            admissions: [SeonggonghouiConfig.ADMISSION_CODES.학생부교과_특성화고교],
            units: [...SeonggonghouiConfig.ALL_UNITS],
            baseScore: 300,
            maxGrade: 9,
            gradeDivisor: 8,
            multiplier: 200,
        },
    ];

    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [SeonggonghouiConfig.ADMISSION_CODES.학생부교과_특성화고교],
            units: [...SeonggonghouiConfig.ALL_UNITS],
            digits: 3,
        },
    ];
}
