import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';
import { ValidationConfig } from '../handlers/student-validation-handler';
import { TopCourseSelectionConfig } from '../handlers/top-course-selection-handler';
import { WeightedFinalScoreConfig } from '../handlers/weighted-finalScore-calculation-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { AssessmentConversionConfig } from '../handlers/assessment-conversion-handler';
import { SubjectGroupMinimumUnitCheckConfig } from '../handlers/subject-group-minimum-unit-check-handler';

export class DeoksungConfig {
    private static readonly ADMISSION_CODES = {
        기회균형전형I_사회통합: '11',
        고교추천전형: '61',
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
        '01': '고교추천전형',
        '02': '기회균형전형I_사회통합',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {};

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = Object.values(DeoksungConfig.ADMISSION_CODES);

    // 모든 모집단위
    private static readonly ALL_UNIT_CODES: string[] = Object.values(DeoksungConfig.UNIT_CODES);

    readonly validationConfig: ValidationConfig = {
        admissions: [...DeoksungConfig.ALL_ADMISSIONS],
        units: [...DeoksungConfig.ALL_UNIT_CODES],
    };

    // 반영 학기 설정: 3학년 1학기까지
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...DeoksungConfig.ALL_ADMISSIONS],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true,
            isNotAppliedForGraduate: false, // 재학생, 졸업생 모두 3-1까지
        },
    ];

    // 반영 과목 설정: 국어, 영어, 수학, 사회, 과학
    readonly subjectConfigs: SubjectConfig[] = [
        {
            admissions: [...DeoksungConfig.ALL_ADMISSIONS],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
            reflectedSubjects: ['국어', '영어', '수학', '사회', '과학'],
        },
    ];

    // 공통 및 일반선택 석차등급 -> 점수 변환
    readonly commonGeneralGradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...DeoksungConfig.ALL_ADMISSIONS],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01'], // 공통, 일반선택
            gradeMapping: {
                1: 100,
                2: 99,
                3: 98,
                4: 97,
                5: 96,
                6: 92,
                7: 86,
                8: 80,
                9: 0,
            },
        },
    ];

    // 진로선택 성취도 -> 점수 변환 (환산등급)
    readonly careerAchievementConversionConfig: AchievementToGradeConfig[] = [
        {
            admissions: [...DeoksungConfig.ALL_ADMISSIONS],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
            subjectSeparations: ['02'], // 진로선택
            achievementMapping: {
                A: 100, // 환산등급 1
                B: 99, // 환산등급 2
                C: 97, // 환산등급 4
            },
        },
    ];

    readonly gradeConversionConfig: AssessmentConversionConfig[] = [
        {
            admissions: [...DeoksungConfig.ALL_ADMISSIONS],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01'],
            assessmentMapping: {
                수: 97.9,
                우: 95.7,
                미: 93.5,
                양: 88,
                가: 0,
            },
        },
    ];

    // 진로선택 상위 3개 선택 설정
    readonly top3CareerSelectionConfig: TopCourseSelectionConfig[] = [
        {
            admissions: [...DeoksungConfig.ALL_ADMISSIONS],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
            subjectSeparations: ['02'],
            topCourseCount: 3,
        },
    ];

    // 최소 이수단위 체크 설정 (기회균형전형I_사회통합만 해당)
    readonly minimumUnitCheckConfig: SubjectGroupMinimumUnitCheckConfig[] = [
        {
            admissions: [DeoksungConfig.ADMISSION_CODES.기회균형전형I_사회통합],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
            rules: [
                {
                    subjectGroups: ['국어'],
                    subjectSeparations: ['01'],
                    minimumUnit: 12,
                    defaultScore: 86,
                },
                {
                    subjectGroups: ['영어'],
                    subjectSeparations: ['01'],
                    minimumUnit: 12,
                    defaultScore: 86,
                },
                {
                    subjectGroups: ['수학'],
                    subjectSeparations: ['01'],
                    minimumUnit: 12,
                    defaultScore: 86,
                },
                {
                    subjectGroups: ['사회'],
                    subjectSeparations: ['01'],
                    minimumUnit: 12,
                    defaultScore: 86,
                },
                {
                    subjectGroups: ['과학'],
                    subjectSeparations: ['01'],
                    minimumUnit: 12,
                    defaultScore: 86,
                },
            ],
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...DeoksungConfig.ALL_ADMISSIONS],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
        },
    ];

    // 가중치 최종 점수 계산 설정
    readonly weightedFinalScoreConfig: WeightedFinalScoreConfig[] = [
        {
            admissions: [...DeoksungConfig.ALL_ADMISSIONS],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
            generalWeight: 9,
            careerWeight: 1,
            ignoreZeroCareerScore: false,
            fallbackMappingTable: [
                { min: 100, score: 99 },
                { min: 99, score: 97.9 },
                { min: 97, score: 95.7 },
                { min: 95, score: 93.5 },
                { min: 85, score: 88 },
                { min: 0, score: 0 },
            ],
            roundDigits: 6,
        },
    ];

    // 최종 점수 반올림 설정 (소수점 일곱째 자리에서 반올림)
    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...DeoksungConfig.ALL_ADMISSIONS],
            units: [...DeoksungConfig.ALL_UNIT_CODES],
            digits: 6,
            isNotSavedMethod: true,
        },
    ];
}
