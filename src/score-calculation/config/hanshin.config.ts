import { ValidationConfig } from '../handlers/student-validation-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { TopCourseSelectionConfig } from '../handlers/top-course-selection-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { HanshinWeightedAverageConfig } from '../handlers/hanshin-weighted-average-handler';

export class HanshinConfig {
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
        특기자전형: '80',
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

    // 논술 전형
    private static readonly ESSAY_ADMISSIONS = ['80'];
    // 비논술 전형 (논술을 제외한 모든 전형)
    private static readonly NON_ESSAY_ADMISSIONS = ['11', '12', '61', '62', '72', '74', '75', '76', '78'];

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '01': '전형01',
        '02': '전형02',
        '03': '전형03',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '00': '전체',
    };

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = Object.values(HanshinConfig.ADMISSION_CODES);

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(HanshinConfig.UNIT_CODES);

    readonly validationConfig: ValidationConfig = {
        admissions: [...HanshinConfig.ALL_ADMISSIONS],
        units: [...HanshinConfig.ALL_UNITS],
    };

    // 반영 학기 설정
    // 재학생(졸업 예정자): 3학년 1학기까지
    // 졸업생: 3학년 2학기까지
    // 조기졸업자: 2학년 1학기까지
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...HanshinConfig.ALL_ADMISSIONS],
            units: [...HanshinConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1, // 졸업 예정자: 3-1까지
            excludeEarlyGraduateSecondGradeSecondTerm: true, // 조기 졸업(예정)자: 2-1까지
            isNotAppliedForGraduate: true, // 졸업자: 3-2까지
        },
    ];

    // 교과군 필터링: 국어, 영어, 수학, 사회, 과학 (한국사 제외)
    readonly subjectGroupFilterConfig: SubjectConfig[] = [
        {
            admissions: [...HanshinConfig.ALL_ADMISSIONS],
            units: [...HanshinConfig.ALL_UNITS],
            reflectedSubjects: ['국어', '영어', '수학', '사회', '과학'],
        },
    ];

    // 비논술 전형 등급 -> 점수 변환
    readonly gradeConversionConfigNonEssay: GradeConversionConfig[] = [
        {
            admissions: [...HanshinConfig.NON_ESSAY_ADMISSIONS],
            units: [...HanshinConfig.ALL_UNITS],
            subjectSeparations: ['01', '02', '03'], // 공통, 일반선택
            gradeMapping: {
                1: 100,
                2: 99,
                3: 98,
                4: 97,
                5: 96,
                6: 95,
                7: 94,
                8: 80,
                9: 50,
            },
        },
    ];

    // 논술 전형 등급 -> 점수 변환
    readonly gradeConversionConfigEssay: GradeConversionConfig[] = [
        {
            admissions: [...HanshinConfig.ESSAY_ADMISSIONS],
            units: [...HanshinConfig.ALL_UNITS],
            subjectSeparations: ['01', '02', '03'], // 공통, 일반선택
            gradeMapping: {
                1: 100,
                2: 99,
                3: 98,
                4: 97,
                5: 96,
                6: 95,
                7: 94,
                8: 90,
                9: 85,
            },
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...HanshinConfig.ALL_ADMISSIONS],
            units: [...HanshinConfig.ALL_UNITS],
        },
    ];

    // 우수 12개 과목 선택
    readonly topCourseSelectionConfig: TopCourseSelectionConfig[] = [
        {
            admissions: [...HanshinConfig.ALL_ADMISSIONS],
            units: [...HanshinConfig.ALL_UNITS],
            subjectSeparations: ['01', '02', '03'], // 모든 과목 유형
            topCourseCount: 12,
        },
    ];

    // 가중평균 계산 (비논술)
    // 12개 과목 미달 시 0점 처리
    // 가중평균 소수점 셋째자리까지 올림
    // 최종 점수 = 가중평균 × 10 (소수점 둘째자리까지 올림)
    readonly weightedAverageConfigNonEssay: HanshinWeightedAverageConfig[] = [
        {
            admissions: [...HanshinConfig.NON_ESSAY_ADMISSIONS],
            units: [...HanshinConfig.ALL_UNITS],
            minCourseCount: 12,
            defaultScore: 50,
            multiplier: 10,
            intermediateRoundDigits: 3, // 소수점 셋째자리까지
            finalRoundDigits: 2, // 소수점 둘째자리까지
        },
    ];

    // 가중평균 계산 (논술)
    // 12개 과목 미달 시 0점 처리
    readonly weightedAverageConfigEssay: HanshinWeightedAverageConfig[] = [
        {
            admissions: [...HanshinConfig.ESSAY_ADMISSIONS],
            units: [...HanshinConfig.ALL_UNITS],
            minCourseCount: 12,
            defaultScore: 85,
            multiplier: 2,
            intermediateRoundDigits: 3, // 소수점 셋째자리까지
            finalRoundDigits: 2, // 소수점 둘째자리까지
        },
    ];
}
