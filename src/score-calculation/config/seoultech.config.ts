import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { ValidationV2Config } from '../handlers/studnet-validation-handler-v2';
import { TopCourseSelectionConfig } from '../handlers/top-course-selection-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';
import { MinimumUnitRequirementConfig } from '../handlers/minimum-unit-requirement-handler';

export class SeoultechConfig {
    private static readonly ADMISSION_CODES = {
        학생부교과_고교추천: '61',
        학생부교과_특성화고: '80',
        논술전형: '11',
        실기전형: '62',
    } as const;

    private static readonly UNIT_CODES = {
        자연계열: '46',
        인문계열: '18',
        건축학부: '29',
        미래융합대학: '20',
        ST자유전공학부: '04',
        조형대학: '19',
    } as const;

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '61': '학생부교과(고교추천)',
        '80': '학생부교과(특성화고)',
        '11': '논술전형',
        '62': '실기전형',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '46': '자연계열',
        '18': '인문계열',
        '29': '건축학부',
        '20': '미래융합대학',
        '04': 'ST자유전공학부',
        '19': '조형대학',
    };

    private static readonly ALL_ADMISSIONS: string[] = Object.values(SeoultechConfig.ADMISSION_CODES);
    private static readonly ALL_UNITS: string[] = Object.values(SeoultechConfig.UNIT_CODES);

    // 가능한 전형-모집단위 조합 검증
    readonly validationV2Config: ValidationV2Config = {
        filters: [
            {
                admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_고교추천],
                units: [
                    SeoultechConfig.UNIT_CODES.자연계열,
                    SeoultechConfig.UNIT_CODES.인문계열,
                    SeoultechConfig.UNIT_CODES.건축학부,
                ],
            },
            {
                admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_특성화고],
                units: [SeoultechConfig.UNIT_CODES.미래융합대학],
            },
            {
                admissions: [SeoultechConfig.ADMISSION_CODES.논술전형],
                units: [SeoultechConfig.UNIT_CODES.ST자유전공학부],
            },
            {
                admissions: [SeoultechConfig.ADMISSION_CODES.실기전형],
                units: [SeoultechConfig.UNIT_CODES.조형대학],
            },
        ],
    };

    // 반영 학기 설정
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        // 3-1학기까지
        {
            admissions: [
                SeoultechConfig.ADMISSION_CODES.학생부교과_고교추천,
                SeoultechConfig.ADMISSION_CODES.논술전형,
                SeoultechConfig.ADMISSION_CODES.실기전형,
            ],
            units: [...SeoultechConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true,
            isNotAppliedForGraduate: false,
        },
        // 2-2학기까지 (특성화고)
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_특성화고],
            units: [SeoultechConfig.UNIT_CODES.미래융합대학],
            maxGrade: 2,
            maxTerm: 2,
            excludeEarlyGraduateSecondGradeSecondTerm: false,
            isNotAppliedForGraduate: false,
        },
    ];

    // 반영 과목 설정 - 공통/일반선택(01)
    readonly subjectConfigs: SubjectConfig[] = [
        // 61-46: 자연계열 (국어, 수학, 영어, 과학)
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_고교추천],
            units: [SeoultechConfig.UNIT_CODES.자연계열],
            reflectedSubjects: ['국어', '수학', '영어', '과학'],
        },
        // 61-18: 인문계열 (국어, 수학, 영어, 사회, 한국사)
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_고교추천],
            units: [SeoultechConfig.UNIT_CODES.인문계열],
            reflectedSubjects: ['국어', '수학', '영어', '사회', '한국사'],
        },
        // 61-29: 건축학부 (국어, 수학, 영어, 과학, 사회, 한국사)
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_고교추천],
            units: [SeoultechConfig.UNIT_CODES.건축학부],
            reflectedSubjects: ['국어', '수학', '영어', '과학', '사회', '한국사'],
        },
        // 80-20: 특성화고 (전과목)
        // 11-04: 논술전형 (국어, 수학, 영어, 과학)
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.논술전형],
            units: [SeoultechConfig.UNIT_CODES.ST자유전공학부],
            reflectedSubjects: ['국어', '수학', '영어', '과학'],
        },
        // 62-19: 실기전형 (국어, 영어, 사회, 한국사)
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.실기전형],
            units: [SeoultechConfig.UNIT_CODES.조형대학],
            reflectedSubjects: ['국어', '영어', '사회', '한국사'],
        },
    ];

    // 석차등급 -> 점수 변환 (공통/일반선택)
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        // 대부분의 전형 (논술 제외)
        {
            admissions: [
                SeoultechConfig.ADMISSION_CODES.학생부교과_고교추천,
                SeoultechConfig.ADMISSION_CODES.학생부교과_특성화고,
                SeoultechConfig.ADMISSION_CODES.실기전형,
            ],
            units: [...SeoultechConfig.ALL_UNITS],
            subjectSeparations: ['01'],
            gradeMapping: {
                1: 1000,
                2: 990,
                3: 980,
                4: 970,
                5: 960,
                6: 800,
                7: 500,
                8: 250,
                9: 0,
            },
        },
        // 논술전형
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.논술전형],
            units: [SeoultechConfig.UNIT_CODES.ST자유전공학부],
            subjectSeparations: ['01'],
            gradeMapping: {
                1: 300,
                2: 295,
                3: 290,
                4: 280,
                5: 270,
                6: 260,
                7: 220,
                8: 170,
                9: 0,
            },
        },
    ];

    // 석차등급 -> 점수 변환 (공통/일반선택)
    readonly specialGradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_특성화고],
            units: [SeoultechConfig.UNIT_CODES.미래융합대학],
            subjectSeparations: ['01'],
            gradeMapping: {
                A: 1000,
                B: 990,
                C: 980,
                D: 970,
                E: 960,
            },
        },
    ];

    // 진로선택과목(02) 성취도 -> 점수 변환
    readonly careerAchievementConversionConfig: AchievementToGradeConfig[] = [
        // 고교추천 전형
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_고교추천],
            units: [
                SeoultechConfig.UNIT_CODES.자연계열,
                SeoultechConfig.UNIT_CODES.인문계열,
                SeoultechConfig.UNIT_CODES.건축학부,
            ],
            subjectSeparations: ['02'],
            achievementMapping: {
                A: 1000,
                B: 980,
                C: 960,
            },
        },
        // 특성화고 - 진로선택
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_특성화고],
            units: [SeoultechConfig.UNIT_CODES.미래융합대학],
            subjectSeparations: ['02'],
            achievementMapping: {
                A: 1000,
                B: 980,
                C: 960,
            },
        },
    ];

    // // 전문교과 성취도 -> 점수 변환 (특성화고만)
    // readonly professionalAchievementConversionConfig: AchievementToGradeConfig[] = [
    //     {
    //         admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_특성화고],
    //         units: [SeoultechConfig.UNIT_CODES.미래융합대학],
    //         subjectSeparations: ['01'],
    //         achievementMapping: {
    //             A: 1000,
    //             B: 990,
    //             C: 980,
    //             D: 970,
    //             E: 960,
    //         },
    //     },
    // ];

    // 진로선택 상위 3과목 선택
    readonly top3CareerSelectionConfig: TopCourseSelectionConfig[] = [
        // 고교추천 전형
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_고교추천],
            units: [
                SeoultechConfig.UNIT_CODES.자연계열,
                SeoultechConfig.UNIT_CODES.인문계열,
                SeoultechConfig.UNIT_CODES.건축학부,
            ],
            subjectSeparations: ['02'],
            topCourseCount: 3,
        },
        // 특성화고
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_특성화고],
            units: [SeoultechConfig.UNIT_CODES.미래융합대학],
            subjectSeparations: ['02'],
            topCourseCount: 3,
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...SeoultechConfig.ALL_ADMISSIONS],
            units: [...SeoultechConfig.ALL_UNITS],
        },
    ];

    // 최소 이수단위 검증 설정
    readonly minimumUnitRequirementConfig: MinimumUnitRequirementConfig[] = [
        {
            admissions: [SeoultechConfig.ADMISSION_CODES.학생부교과_고교추천],
            units: [
                SeoultechConfig.UNIT_CODES.자연계열,
                SeoultechConfig.UNIT_CODES.인문계열,
                SeoultechConfig.UNIT_CODES.건축학부,
            ],
            minimumUnit: 90,
        },
    ];

    // 최종 점수 계산 설정 (이수가중평균)
    readonly finalScoreConfig: FinalScoreConfig[] = [
        {
            admissions: [...SeoultechConfig.ALL_ADMISSIONS],
            units: [...SeoultechConfig.ALL_UNITS],
        },
    ];

    // 최종 점수 반올림 설정 (소수점 넷째 자리에서 반올림)
    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...SeoultechConfig.ALL_ADMISSIONS],
            units: [...SeoultechConfig.ALL_UNITS],
            digits: 3,
        },
    ];
}
