import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';
import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { ValidationConfig } from '../handlers/student-validation-handler';
import { PercentileGradeConfig } from '../handlers/percentile-grade-conversion-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { RequiredSubjectGroupConfig } from '../handlers/required-subject-group-handler';

export class DankookConfig {
    private static readonly ADMISSION_CODES = {
        전형11: '11',
        전형12: '12',
        전형61: '61',
        전형62: '62',
        전형72: '72',
        체육특기자: '74',
        전형75: '75',
        전형76: '76',
        전형78: '78',
        전형80: '80',
    } as const;

    private static readonly UNIT_CODES: Record<string, string> = {
        체육: '01',
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
        예능: '23',
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
        '74': '체육특기자',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '01': '체육',
        '23': '예능',
    };

    private static readonly SPORTS_ADMISSION: string[] = [this.ADMISSION_CODES.체육특기자];

    // 모든 일반 전형 (체육특기자 제외)
    private static readonly STANDARD_ADMISSIONS: string[] = Object.values(DankookConfig.ADMISSION_CODES).filter(
        value => !DankookConfig.SPORTS_ADMISSION.includes(value),
    );

    // 예능, 체육 모집단위
    private static readonly ARTS_SPORTS_UNITS = [this.UNIT_CODES.예능, this.UNIT_CODES.체육];

    // 모든 모집단위 (예능, 체육 제외)
    private static readonly STANDARD_UNITS: string[] = Object.values(DankookConfig.UNIT_CODES).filter(
        value => !DankookConfig.ARTS_SPORTS_UNITS.includes(value),
    );

    // 모든 모집단위
    private static readonly ALL_UNIT_CODES: string[] = Object.values(DankookConfig.UNIT_CODES);

    // 모든 전형
    private static readonly ALL_ADMISSIONS_CODES: string[] = [
        ...DankookConfig.STANDARD_ADMISSIONS,
        ...DankookConfig.SPORTS_ADMISSION,
    ];

    readonly validationConfig: ValidationConfig = {
        admissions: [...DankookConfig.ALL_ADMISSIONS_CODES],
        units: [...DankookConfig.ALL_UNIT_CODES],
    };

    // 반영 학기 설정
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...DankookConfig.ALL_ADMISSIONS_CODES],
            units: [...DankookConfig.ALL_UNIT_CODES],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true,
            isNotAppliedForGraduate: true, // 재학생: 3-1까지, 졸업생: 3-2까지
        },
    ];

    // 반영 과목 설정
    readonly subjectConfigs: SubjectConfig[] = [
        // 예능, 체육: 국어, 영어, 사회
        {
            admissions: [...DankookConfig.ALL_ADMISSIONS_CODES],
            units: [...DankookConfig.ARTS_SPORTS_UNITS],
            reflectedSubjects: ['국어', '영어', '사회'],
        },
        // 전 모집단위 (예능, 체육 제외): 국어, 영어, 수학, 사회, 과학
        {
            admissions: [...DankookConfig.ALL_ADMISSIONS_CODES],
            units: [...DankookConfig.STANDARD_UNITS],
            reflectedSubjects: ['국어', '수학', '영어', '사회', '과학'],
        },
    ];

    // 성취도 -> 석차등급 변환 설정 (A->1, B->3, C->5)
    readonly achievementToGradeConfig: AchievementToGradeConfig[] = [
        {
            admissions: [...DankookConfig.STANDARD_ADMISSIONS],
            units: [...DankookConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '02'], // 공통/일반
            achievementMapping: {
                A: 100,
                B: 98,
                C: 96,
            },
        },
        {
            admissions: [...DankookConfig.SPORTS_ADMISSION],
            units: [...DankookConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '02'], // 공통/일반
            achievementMapping: {
                A: 100,
                B: 90,
                C: 80,
            },
        },
    ];

    // 석차백분율 -> 석차등급 -> 점수 변환 설정
    readonly percentileGradeConfig: PercentileGradeConfig[] = [
        // 일반 전형
        {
            admissions: [...DankookConfig.STANDARD_ADMISSIONS],
            units: [...DankookConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '03'], // 공통/일반
            graduateYearThreshold: 9999, // 모든 학생에게 적용 (석차등급이 없는 경우)
            gradeScoreMapping: {
                1: 100,
                2: 99,
                3: 98,
                4: 97,
                5: 96,
                6: 95,
                7: 70,
                8: 40,
                9: 0,
            },
        },
        // 체육특기자
        {
            admissions: [...DankookConfig.SPORTS_ADMISSION],
            units: [...DankookConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '03'], // 공통/일반
            graduateYearThreshold: 9999, // 모든 학생에게 적용 (석차등급이 없는 경우)
            gradeScoreMapping: {
                1: 100,
                2: 95,
                3: 90,
                4: 85,
                5: 80,
                6: 75,
                7: 70,
                8: 65,
                9: 60,
            },
        },
    ];

    // 석차등급 -> 점수 변환 설정 (일반)
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...DankookConfig.STANDARD_ADMISSIONS],
            units: [...DankookConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '03'], // 공통/일반
            gradeMapping: {
                1: 100,
                2: 99,
                3: 98,
                4: 97,
                5: 96,
                6: 95,
                7: 70,
                8: 40,
                9: 0,
            },
        },
        // 체육특기자
        {
            admissions: [...DankookConfig.SPORTS_ADMISSION],
            units: [...DankookConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '03'], // 공통/일반
            gradeMapping: {
                1: 100,
                2: 95,
                3: 90,
                4: 85,
                5: 80,
                6: 75,
                7: 70,
                8: 65,
                9: 60,
            },
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...DankookConfig.ALL_ADMISSIONS_CODES],
            units: [...DankookConfig.ALL_UNIT_CODES],
        },
    ];

    // 이수가중평균 설정
    readonly finalScoreConfig: FinalScoreConfig[] = [
        {
            admissions: [...DankookConfig.ALL_ADMISSIONS_CODES],
            units: [...DankookConfig.ALL_UNIT_CODES],
        },
    ];

    // 최종 점수 반올림 설정 (소수점 넷째 자리에서 반올림)
    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...DankookConfig.ALL_ADMISSIONS_CODES],
            units: [...DankookConfig.ALL_UNIT_CODES],
            digits: 3,
        },
    ];

    // 필수 교과군 검증 설정
    readonly requiredSubjectGroupConfig: RequiredSubjectGroupConfig[] = [
        // 예능, 체육: 국어, 영어, 사회 필수
        {
            admissions: [...DankookConfig.ALL_ADMISSIONS_CODES],
            units: [...DankookConfig.ARTS_SPORTS_UNITS],
            requiredSubjectGroups: ['국어', '영어', '사회'],
        },
        // 전 모집단위 (예능, 체육 제외): 국어, 영어, 수학, 사회, 과학 필수
        {
            admissions: [...DankookConfig.ALL_ADMISSIONS_CODES],
            units: [...DankookConfig.STANDARD_UNITS],
            requiredSubjectGroups: ['국어', '수학', '영어', '사회', '과학'],
        },
    ];
}
