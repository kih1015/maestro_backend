import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';
import { ValidationConfig } from '../handlers/student-validation-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { CreditBonusConfig } from '../handlers/credit-bonus-handler';
import { WeightApplyConfig } from '../handlers/weight-apply-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';
import { AssessmentConversionConfig } from '../handlers/assessment-conversion-handler';

export class MyongjiConfig {
    private static readonly ADMISSION_CODES = {
        학생부교과_일반: '61',
        학생부교과_특성화고교: '62',
        실기실적: '11',
    } as const;

    private static readonly UNIT_CODES = {
        인문사회계열: '46',
        자연공학계열: '20',
        예체능계열: '18',
    } as const;

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '61': '학생부교과(특성화고교전형 외)',
        '62': '학생부교과(특성화고교전형)',
        '11': '실기/실적',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '46': '인문사회계열',
        '20': '자연공학계열',
        '18': '예체능계열',
    };

    // 일반전형 (학생부교과_일반, 실기실적)
    private static readonly GENERAL_ADMISSIONS: string[] = [
        MyongjiConfig.ADMISSION_CODES.학생부교과_일반,
        MyongjiConfig.ADMISSION_CODES.실기실적,
    ];

    // 특성화고교전형
    private static readonly SPECIALIZED_ADMISSIONS: string[] = [MyongjiConfig.ADMISSION_CODES.학생부교과_특성화고교];

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = [
        ...MyongjiConfig.GENERAL_ADMISSIONS,
        ...MyongjiConfig.SPECIALIZED_ADMISSIONS,
    ];

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(MyongjiConfig.UNIT_CODES);

    readonly validationConfig: ValidationConfig = {
        admissions: [...MyongjiConfig.ALL_ADMISSIONS],
        units: [...MyongjiConfig.ALL_UNITS],
    };

    // 반영 학기 설정: 3학년 1학기까지
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...MyongjiConfig.ALL_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true,
            isNotAppliedForGraduate: false, // 재학생, 졸업생 모두 3-1까지
        },
    ];

    // 반영 과목 설정
    readonly subjectConfigs: SubjectConfig[] = [
        // 인문사회계열: 국어, 수학, 영어, 사회
        {
            admissions: [...MyongjiConfig.GENERAL_ADMISSIONS],
            units: [MyongjiConfig.UNIT_CODES.인문사회계열],
            reflectedSubjects: ['국어', '수학', '영어', '사회'],
        },
        // 자연공학계열: 국어, 수학, 영어, 과학
        {
            admissions: [...MyongjiConfig.GENERAL_ADMISSIONS],
            units: [MyongjiConfig.UNIT_CODES.자연공학계열],
            reflectedSubjects: ['국어', '수학', '영어', '과학'],
        },
        // 예체능계열: 국어, 영어
        {
            admissions: [...MyongjiConfig.GENERAL_ADMISSIONS],
            units: [MyongjiConfig.UNIT_CODES.예체능계열],
            reflectedSubjects: ['국어', '영어'],
        },
        // 특성화고교전형: 모든 과목 (전문교과 포함)
    ];

    // 공통 및 일반선택 석차등급 -> 점수 변환 (일반전형)
    readonly commonGeneralGradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...MyongjiConfig.GENERAL_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
            subjectSeparations: ['01'], // 공통, 일반선택
            gradeMapping: {
                1: 100,
                2: 99,
                3: 98,
                4: 94,
                5: 90,
                6: 80,
                7: 60,
                8: 30,
                9: 0,
            },
        },
        {
            admissions: [...MyongjiConfig.SPECIALIZED_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'], // 공통, 일반선택
            gradeMapping: {
                1: 100,
                2: 99,
                3: 98, // A = 3등급
                4: 94, // B = 4등급
                5: 90,
                6: 80, // C = 6등급
                7: 60,
                8: 30, // D = 8등급
                9: 0, // E = 9등급
            },
        },
    ];

    // 진로선택 성취도 -> 석차등급 변환 (일반전형)
    readonly careerAchievementConversionConfig: AchievementToGradeConfig[] = [
        {
            admissions: [...MyongjiConfig.GENERAL_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
            subjectSeparations: ['02'], // 진로선택
            achievementMapping: {
                A: 100, // A = 1등급 = 100점
                B: 99, // B = 2등급 = 99점
                C: 94, // C = 4등급 = 94점
                D: 30,
                E: 0,
            },
        },
        {
            admissions: [...MyongjiConfig.SPECIALIZED_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
            subjectSeparations: ['02', '03'], // 진로선택
            achievementMapping: {
                A: 98, // A = 98점
                B: 94, // B = 94점
                C: 80, // C = 80점
                D: 30, // D = 30점
                E: 0, // E = 0점
            },
        },
    ];

    readonly gradeConversionConfig: AssessmentConversionConfig[] = [
        {
            admissions: [...MyongjiConfig.GENERAL_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
            subjectSeparations: ['01'], // 진로선택
            assessmentMapping: {
                수: 100, // A = 1등급 = 100점
                우: 99, // B = 2등급 = 99점
                미: 94, // C = 4등급 = 94점
                양: 30,
                가: 0,
            },
        },
        {
            admissions: [...MyongjiConfig.SPECIALIZED_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
            subjectSeparations: ['01'], // 진로선택
            assessmentMapping: {
                수: 98, // A = 98점
                우: 94, // B = 94점
                미: 80, // C = 80점
                양: 30, // D = 30점
                가: 0, // E = 0점
            },
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...MyongjiConfig.ALL_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
        },
    ];

    // 최종 점수 계산 설정 (가중평균)
    readonly finalScoreConfig: FinalScoreConfig[] = [
        {
            admissions: [...MyongjiConfig.ALL_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
        },
    ];

    // 가산점 계산 설정 (이수학점 합계 × 0.05)
    readonly creditBonusConfig: CreditBonusConfig[] = [
        {
            admissions: [...MyongjiConfig.ALL_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
            bonusMultiplier: 0.05,
        },
    ];

    // 최종 점수 반올림 설정 (소수점 넷째자리에서 반올림 = 3자리까지)
    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...MyongjiConfig.ALL_ADMISSIONS],
            units: [...MyongjiConfig.ALL_UNITS],
            digits: 3,
        },
    ];

    // 전형별 교과성적 환산 점수 (배율 적용)
    readonly weightApplyConfig: WeightApplyConfig[] = [
        // 학생부교과(일반, 특성화고교): ×10
        {
            admissions: [
                MyongjiConfig.ADMISSION_CODES.학생부교과_일반,
                MyongjiConfig.ADMISSION_CODES.학생부교과_특성화고교,
            ],
            units: [...MyongjiConfig.ALL_UNITS],
            weight: 10,
        },
        // 실기/실적: ×2
        {
            admissions: [MyongjiConfig.ADMISSION_CODES.실기실적],
            units: [...MyongjiConfig.ALL_UNITS],
            weight: 2,
        },
    ];
}
