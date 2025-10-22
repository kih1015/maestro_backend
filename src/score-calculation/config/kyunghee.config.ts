import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { SubjectSeparationConfig } from '../handlers/course-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { WeightedFinalScoreConfig } from '../handlers/weighted-finalScore-calculation-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { TopCourseSelectionConfig } from '../handlers/top-course-selection-handler';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';
import { WeightApplyConfig } from '../handlers/weight-apply-handler';
import { GraduationEligibilityConfig } from '../handlers/graduation-eligibility-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';

export class KyungheeConfig {
    private static readonly ADMISSION_CODES = {
        지역균형: '61',
        기회균형전형I: '11',
        기회균형전형II: '62',
        실기우수자전형: '74',
    } as const;

    private static readonly UNIT_CODES = {
        자율전공학부: '18',
        자유전공학부: '29',
        인문: '04',
        자연: '36',
        예술: '23',
        체육: '01',
    } as const;

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '61': '지역균형',
        '11': '기회균형전형I',
        '62': '기회균형전형II',
        '74': '실기우수자전형',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '18': '자율전공학부',
        '29': '자유전공학부',
        '04': '인문',
        '36': '자연',
        '23': '예술',
        '01': '체육',
    };

    private static readonly ALL_ADMISSIONS_CODES = [
        this.ADMISSION_CODES.지역균형,
        this.ADMISSION_CODES.기회균형전형I,
        this.ADMISSION_CODES.기회균형전형II,
        this.ADMISSION_CODES.실기우수자전형,
    ];

    private static readonly ALL_UNIT_CODES = [
        this.UNIT_CODES.자율전공학부,
        this.UNIT_CODES.자유전공학부,
        this.UNIT_CODES.인문,
        this.UNIT_CODES.자연,
        this.UNIT_CODES.예술,
        this.UNIT_CODES.체육,
    ];

    private static readonly ACADEMIC_UNITS = [
        this.UNIT_CODES.자율전공학부,
        this.UNIT_CODES.자유전공학부,
        this.UNIT_CODES.인문,
        this.UNIT_CODES.자연,
    ];

    private static readonly ART_SPORTS_UNITS = [this.UNIT_CODES.예술, this.UNIT_CODES.체육];

    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ALL_UNIT_CODES],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true,
            isNotAppliedForGraduate: true,
        },
    ];

    readonly subjectConfigs: SubjectConfig[] = [
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ACADEMIC_UNITS], // 자율/자유/인문/자연
            reflectedSubjects: ['국어', '영어', '수학', '사회', '과학', '한국사'],
        },
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ART_SPORTS_UNITS], // 예술/체육
            reflectedSubjects: ['국어', '영어'],
        },
    ];

    readonly subjectSeparationsConfigs: SubjectSeparationConfig[] = [
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '02'], // 공통/일반, 진로선택
        },
    ];

    // === 등급 환산 설정 ===
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        // 지역균형 - 공통/일반선택과목
        {
            admissions: ['61'],
            units: [...KyungheeConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01'],
            gradeMapping: {
                1: 100,
                2: 96,
                3: 89,
                4: 77,
                5: 60,
                6: 40,
                7: 23,
                8: 11,
                9: 0,
            },
        },
        // 기회균형I, II, 실기우수자(예술) - 공통/일반선택과목
        {
            admissions: ['11', '62'],
            units: [...KyungheeConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01'],
            gradeMapping: {
                1: 100,
                2: 99,
                3: 97,
                4: 94,
                5: 90,
                6: 85,
                7: 73,
                8: 49,
                9: 0,
            },
        },
        {
            admissions: ['74'],
            units: [KyungheeConfig.UNIT_CODES.예술],
            subjectSeparations: ['01'],
            gradeMapping: {
                1: 100,
                2: 99,
                3: 97,
                4: 94,
                5: 90,
                6: 85,
                7: 73,
                8: 49,
                9: 0,
            },
        },
        // 실기우수자(체육) - 공통/일반선택과목
        {
            admissions: ['74'],
            units: [KyungheeConfig.UNIT_CODES.체육], // 체육
            subjectSeparations: ['01'],
            gradeMapping: {
                1: 100,
                2: 99,
                3: 98,
                4: 97,
                5: 96,
                6: 95,
                7: 94,
                8: 93,
                9: 90,
            },
        },
    ];

    readonly achievementToGradeConfig: AchievementToGradeConfig[] = [
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ALL_UNIT_CODES],
            subjectSeparations: ['02'], // 진로선택과목만
            achievementMapping: {
                A: 100,
                B: 80,
                C: 60,
            },
        },
    ];

    readonly topCourseSelectionConfig: TopCourseSelectionConfig[] = [
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ACADEMIC_UNITS], // 자율/자유/인문/자연
            subjectSeparations: ['02'], // 진로선택과목
            topCourseCount: 3, // 상위 3개 과목
        },
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ART_SPORTS_UNITS], // 예술/체육
            subjectSeparations: ['02'], // 진로선택과목
            topCourseCount: 3, // 상위 3개 과목
        },
    ];

    readonly weightedFinalScoreConfig: WeightedFinalScoreConfig[] = [
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ALL_UNIT_CODES],
            generalWeight: 0.8,
            careerWeight: 0.2,
            ignoreZeroCareerScore: true,
        },
    ];

    readonly weightApplyConfig: WeightApplyConfig[] = [
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ALL_UNIT_CODES],
            weight: 10,
        },
    ];

    readonly graduationEligibilityConfig: GraduationEligibilityConfig[] = [
        // 지역균형전형 - 지원자 전체 (졸업년도 제한 없음)
        {
            admissions: ['61'],
            units: [...KyungheeConfig.ACADEMIC_UNITS],
            minGraduateYear: null,
            maxGraduateYear: null,
        },
        // 기회균형전형 I (특성화고 재직자) - 2021년 ~ 2023년 졸업자
        {
            admissions: ['11'],
            units: [...KyungheeConfig.ACADEMIC_UNITS],
            minGraduateYear: '2021',
            maxGraduateYear: '2023',
            requireSpecializedSchool: true,
        },
        // 기회균형전형 I (일반), 기회균형전형 II - 2024년 ~ 2026년 졸업(예정)자
        {
            admissions: ['11', '62'],
            units: [...KyungheeConfig.ACADEMIC_UNITS],
            minGraduateYear: '2024',
            maxGraduateYear: '2026',
        },
        // 실기우수자전형 - 2024년 ~ 2026년 졸업(예정)자
        {
            admissions: ['74'],
            units: [...KyungheeConfig.ART_SPORTS_UNITS],
            minGraduateYear: '2024',
            maxGraduateYear: '2026',
        },
    ];

    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...KyungheeConfig.ALL_ADMISSIONS_CODES],
            units: [...KyungheeConfig.ALL_UNIT_CODES],
            digits: 3,
        },
    ];
}
