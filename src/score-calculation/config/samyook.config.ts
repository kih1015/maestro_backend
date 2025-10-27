import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { WeightApplyConfig } from '../handlers/weight-apply-handler';
import { ValidationV2Config } from '../handlers/studnet-validation-handler-v2';
import { BestSubjectSelectionConfig } from '../handlers/best-subject-selection-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';
import { SubjectGroupTransformConfig } from '../handlers/subject-group-transform-handler';

export class SamyookConfig {
    private static readonly ADMISSION_CODES = {
        학교장추천: '61',
        특성화고교: '11',
        예체능인재: '62',
    } as const;

    private static readonly UNIT_CODES = {
        일반학과: '46',
        아트앤디자인학과: '20',
        체육학과: '18',
    } as const;

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '61': '학교장추천',
        '11': '특성화고교',
        '62': '예체능인재',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '46': '일반학과(부)',
        '20': '아트앤디자인학과',
        '18': '체육학과',
    };

    // 가능한 조합: 61-46, 61-20, 61-18, 11-46, 62-18
    private static readonly ALL_ADMISSIONS: string[] = Object.values(SamyookConfig.ADMISSION_CODES);
    private static readonly ALL_UNITS: string[] = Object.values(SamyookConfig.UNIT_CODES);

    readonly validationV2Config: ValidationV2Config = {
        filters: [
            {
                admissions: [SamyookConfig.ADMISSION_CODES.학교장추천],
                units: [...SamyookConfig.ALL_UNITS],
            },
            {
                admissions: [SamyookConfig.ADMISSION_CODES.특성화고교],
                units: [SamyookConfig.UNIT_CODES.일반학과],
            },
            {
                admissions: [SamyookConfig.ADMISSION_CODES.예체능인재],
                units: [SamyookConfig.UNIT_CODES.체육학과],
            },
        ],
    };

    // 반영 학기 설정
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...SamyookConfig.ALL_ADMISSIONS],
            units: [...SamyookConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1, // 졸업(예정)자: 3-1
            excludeEarlyGraduateSecondGradeSecondTerm: true, // 조기졸업(예정)자: 2-1
            isNotAppliedForGraduate: false,
        },
    ];

    readonly subjectGroupTransformConfig: SubjectGroupTransformConfig[] = [
        {
            admissions: [...SamyookConfig.ALL_ADMISSIONS],
            units: [...SamyookConfig.ALL_UNITS],
            subjectGroupTransformMapping: {
                사회: '탐구',
                과학: '탐구',
            },
        },
    ];

    // 반영 과목 설정
    readonly subjectConfigs: SubjectConfig[] = [
        // 학교장추천 + 일반학과(부): 국어, 영어, 수학, 사회, 과학 전 과목
        {
            admissions: [SamyookConfig.ADMISSION_CODES.학교장추천],
            units: [SamyookConfig.UNIT_CODES.일반학과],
            reflectedSubjects: ['국어', '영어', '수학', '탐구'],
        },
        // 학교장추천 + 아트앤디자인학과/체육학과: 국어, 영어, 수학, 사회, 과학 (상위 2개 교과영역 선택 예정)
        {
            admissions: [SamyookConfig.ADMISSION_CODES.학교장추천],
            units: [SamyookConfig.UNIT_CODES.아트앤디자인학과, SamyookConfig.UNIT_CODES.체육학과],
            reflectedSubjects: ['국어', '영어', '수학', '탐구'],
        },
        // 예체능인재 + 체육학과: 국어, 영어, 수학, 사회, 과학 (상위 2개 교과영역 선택 예정)
        {
            admissions: [SamyookConfig.ADMISSION_CODES.예체능인재],
            units: [SamyookConfig.UNIT_CODES.체육학과],
            reflectedSubjects: ['국어', '영어', '수학', '탐구'],
        },
        // 특성화고교 + 일반학과(부): 국어, 영어, 수학 전 과목
        {
            admissions: [SamyookConfig.ADMISSION_CODES.특성화고교],
            units: [SamyookConfig.UNIT_CODES.일반학과],
            reflectedSubjects: ['국어', '영어', '수학'],
        },
    ];

    // 석차등급 -> 점수 변환
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...SamyookConfig.ALL_ADMISSIONS],
            units: [...SamyookConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'], // 공통, 일반선택
            gradeMapping: {
                1: 100,
                2: 99,
                3: 98,
                4: 96.5,
                5: 95,
                6: 92,
                7: 85,
                8: 60,
                9: 0,
            },
        },
    ];

    // 진로선택과목 성취도 -> 점수 변환
    readonly careerAchievementConversionConfig: AchievementToGradeConfig[] = [
        {
            admissions: [...SamyookConfig.ALL_ADMISSIONS],
            units: [...SamyookConfig.ALL_UNITS],
            subjectSeparations: ['02'], // 진로선택
            achievementMapping: {
                A: 100,
                B: 99,
                C: 96.5,
            },
        },
    ];

    readonly bestSubjectSelectionConfig: BestSubjectSelectionConfig[] = [
        {
            admissions: [SamyookConfig.ADMISSION_CODES.학교장추천],
            units: [SamyookConfig.UNIT_CODES.아트앤디자인학과, SamyookConfig.UNIT_CODES.체육학과],
            bestSubjectCount: 2,
        },
        {
            admissions: [SamyookConfig.ADMISSION_CODES.예체능인재],
            units: [SamyookConfig.UNIT_CODES.체육학과],
            bestSubjectCount: 2,
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...SamyookConfig.ALL_ADMISSIONS],
            units: [...SamyookConfig.ALL_UNITS],
        },
    ];

    // 최종 점수 계산 설정 (가중평균)
    readonly finalScoreConfig: FinalScoreConfig[] = [
        {
            admissions: [...SamyookConfig.ALL_ADMISSIONS],
            units: [...SamyookConfig.ALL_UNITS],
        },
    ];

    // 전형별 반영교과 비율 적용
    readonly weightApplyConfig: WeightApplyConfig[] = [
        // 학교장추천, 특성화고교 + 일반학과(부): 100%
        {
            admissions: [SamyookConfig.ADMISSION_CODES.학교장추천, SamyookConfig.ADMISSION_CODES.특성화고교],
            units: [SamyookConfig.UNIT_CODES.일반학과],
            weight: 1.0,
        },
        // 학교장추천 + 아트앤디자인학과/체육학과: 100%
        {
            admissions: [SamyookConfig.ADMISSION_CODES.학교장추천],
            units: [SamyookConfig.UNIT_CODES.아트앤디자인학과, SamyookConfig.UNIT_CODES.체육학과],
            weight: 1.0,
        },
        // 예체능인재 + 체육학과: 90%
        {
            admissions: [SamyookConfig.ADMISSION_CODES.예체능인재],
            units: [SamyookConfig.UNIT_CODES.체육학과],
            weight: 0.9,
        },
    ];

    // 최종 점수 반올림 설정 (소수점 넷째자리에서 반올림 = 3자리까지)
    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...SamyookConfig.ALL_ADMISSIONS],
            units: [...SamyookConfig.ALL_UNITS],
            digits: 3,
        },
    ];
}
