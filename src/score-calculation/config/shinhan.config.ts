import { ValidationConfig } from '../handlers/student-validation-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { PercentileGradeConfig } from '../handlers/percentile-grade-conversion-handler';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';
import { TopCourseSelectionConfig } from '../handlers/top-course-selection-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { AverageGradeCalculationConfig } from '../handlers/average-grade-calculation-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';

export class ShinhanConfig {
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
    private static readonly ALL_ADMISSIONS: string[] = Object.values(ShinhanConfig.ADMISSION_CODES);

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(ShinhanConfig.UNIT_CODES);

    readonly validationConfig: ValidationConfig = {
        admissions: [...ShinhanConfig.ALL_ADMISSIONS],
        units: [...ShinhanConfig.ALL_UNITS],
    };

    // 반영 학기 설정
    // 재학생(졸업 예정자): 3학년 1학기까지
    // 졸업생: 3학년 2학기까지
    // 조기졸업자: 2학년 1학기까지
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1, // 졸업 예정자: 3-1까지
            excludeEarlyGraduateSecondGradeSecondTerm: true, // 조기 졸업(예정)자: 2-1까지
            isNotAppliedForGraduate: true, // 졸업자: 3-2까지
        },
    ];

    // 교과군 필터링: 국어, 영어, 수학, 사회, 과학, 한국사
    readonly subjectGroupFilterConfig: SubjectConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
            reflectedSubjects: ['국어', '영어', '수학', '사회', '과학', '한국사'],
        },
    ];

    // 등급 -> 점수 변환
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'], // 공통, 일반선택
            gradeMapping: {
                1: 100,
                2: 99,
                3: 97.5,
                4: 96,
                5: 94.5,
                6: 91.5,
                7: 88.5,
                8: 82,
                9: 68,
            },
        },
    ];

    // 2008년 이전 졸업자: 석차 백분율 -> 등급 변환
    readonly percentileGradeConfig: PercentileGradeConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'],
            graduateYearThreshold: 2008, // 2008년 이전 졸업자에게만 적용
            gradeScoreMapping: {
                1: 100,
                2: 99,
                3: 97.5,
                4: 96,
                5: 94.5,
                6: 91.5,
                7: 88.5,
                8: 82,
                9: 68,
            },
        },
    ];

    // 진로선택과목 성취도 -> 등급 변환
    readonly achievementToGradeConfig: AchievementToGradeConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
            subjectSeparations: ['02'], // 진로선택
            achievementMapping: {
                A: 99, // 99점과 동일 (2등급)
                B: 96, // 96점과 동일 (4등급)
                C: 82, // 82점과 동일 (8등급)
            },
        },
    ];

    // 진로선택과목 최대 1개 선택
    readonly careerSubjectSelectionConfig: TopCourseSelectionConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
            subjectSeparations: ['02'], // 진로선택
            topCourseCount: 1,
        },
    ];

    // 우수 10개 과목 선택
    readonly topCourseSelectionConfig: TopCourseSelectionConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
            subjectSeparations: ['01', '02', '03'], // 모든 과목 유형
            topCourseCount: 10,
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
        },
    ];

    // 최종 점수 계산: (과목별 환산 점수 합) / (과목 수)
    readonly averageGradeCalculationConfig: AverageGradeCalculationConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
        },
    ];

    // 최종 점수 반올림 설정 (소수점 넷째 자리에서 반올림)
    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...ShinhanConfig.ALL_ADMISSIONS],
            units: [...ShinhanConfig.ALL_UNITS],
            digits: 4,
        },
    ];
}
