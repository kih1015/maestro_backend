import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { SubjectWeightedScoreConfig } from '../handlers/subject-weighted-score-handler';
import { CareerSubjectScoreConfig } from '../handlers/career-subject-score-handler';
import { SungsilFinalScoreConfig } from '../handlers/sungsil-final-score-handler';
import { ValidationV2Config } from '../handlers/studnet-validation-handler-v2';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';

export class SungsilConfig {
    private static readonly ADMISSION_CODES = {
        논술우수자: '11',
        학생부우수자: '61',
        예체능우수인재: '62',
    } as const;

    private static readonly UNIT_CODES = {
        자유전공학부_인문: '04',
        자연계열: '18',
        경상계열: '20',
        자유전공학부_자연: '29',
        인문계열: '46',
    } as const;

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '11': '논술우수자',
        '61': '학생부우수자',
        '62': '예체능우수인재',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '04': '자유전공학부(인문)',
        '18': '자연계열',
        '20': '경상계열',
        '29': '자유전공학부(자연)',
        '46': '인문계열',
    };

    // 등급 -> 점수 변환 테이블
    static readonly GRADE_TO_SCORE_MAPPING = {
        학생부우수자: {
            1: 10.0,
            2: 9.5,
            3: 9.0,
            4: 8.5,
            5: 8.0,
            6: 7.0,
            7: 5.0,
            8: 3.0,
            9: 0,
        },
        논술우수자: {
            1: 2.0,
            2: 1.9,
            3: 1.8,
            4: 1.7,
            5: 1.6,
            6: 1.4,
            7: 1.0,
            8: 0.6,
            9: 0,
        },
        예체능우수인재: {
            1: 4.0,
            2: 3.8,
            3: 3.6,
            4: 3.4,
            5: 3.2,
            6: 2.8,
            7: 2.0,
            8: 1.2,
            9: 0,
        },
    };

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = Object.values(SungsilConfig.ADMISSION_CODES);

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(SungsilConfig.UNIT_CODES);

    // 인문계 모집단위
    private static readonly HUMANITIES_UNITS = [
        SungsilConfig.UNIT_CODES.인문계열,
        SungsilConfig.UNIT_CODES.경상계열,
        SungsilConfig.UNIT_CODES.자유전공학부_인문,
    ];

    // 자연계 모집단위
    private static readonly SCIENCE_UNITS = [
        SungsilConfig.UNIT_CODES.자연계열,
        SungsilConfig.UNIT_CODES.자유전공학부_자연,
    ];

    // 진로선택 과목 적용 전형 (학생부우수자, 논술우수자)
    private static readonly CAREER_APPLICABLE_ADMISSIONS = [
        SungsilConfig.ADMISSION_CODES.학생부우수자,
        SungsilConfig.ADMISSION_CODES.논술우수자,
    ];

    readonly validationV2Config: ValidationV2Config = {
        filters: [
            {
                admissions: [...SungsilConfig.CAREER_APPLICABLE_ADMISSIONS],
                units: [...SungsilConfig.ALL_UNITS],
            },
            {
                admissions: [SungsilConfig.ADMISSION_CODES.예체능우수인재],
                units: [SungsilConfig.UNIT_CODES.인문계열],
            },
        ],
    };

    // 반영 학기 설정
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...SungsilConfig.ALL_ADMISSIONS],
            units: [...SungsilConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true, // 조졸자 2-1학기
            isNotAppliedForGraduate: true, // 졸업자 3-2학기
        },
    ];

    // 반영 교과
    readonly subjectGroupFilterConfig: SubjectConfig[] = [
        {
            // 인문계열, 경상계열, 자유전공학부(인문), 예체능우수인재
            admissions: [...SungsilConfig.CAREER_APPLICABLE_ADMISSIONS],
            units: [...SungsilConfig.HUMANITIES_UNITS],
            reflectedSubjects: ['국어', '수학', '영어', '사회', '한국사'],
        },
        {
            // 인문계열, 경상계열, 자유전공학부(인문), 예체능우수인재
            admissions: [SungsilConfig.ADMISSION_CODES.예체능우수인재],
            units: [SungsilConfig.UNIT_CODES.인문계열],
            reflectedSubjects: ['국어', '수학', '영어', '사회', '한국사'],
        },
        {
            // 자연계열, 자유전공학부(자연)
            admissions: [...SungsilConfig.CAREER_APPLICABLE_ADMISSIONS],
            units: [...SungsilConfig.SCIENCE_UNITS],
            reflectedSubjects: ['국어', '수학', '영어', '과학'],
        },
    ];

    // 석차등급 -> 점수 변환 (공통, 일반선택)
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [SungsilConfig.ADMISSION_CODES.학생부우수자],
            units: [...SungsilConfig.ALL_UNITS],
            subjectSeparations: ['01'], // 공통, 일반선택
            gradeMapping: SungsilConfig.GRADE_TO_SCORE_MAPPING.학생부우수자,
        },
        {
            admissions: [SungsilConfig.ADMISSION_CODES.논술우수자],
            units: [...SungsilConfig.ALL_UNITS],
            subjectSeparations: ['01'],
            gradeMapping: SungsilConfig.GRADE_TO_SCORE_MAPPING.논술우수자,
        },
        {
            admissions: [SungsilConfig.ADMISSION_CODES.예체능우수인재],
            units: [...SungsilConfig.ALL_UNITS],
            subjectSeparations: ['01'],
            gradeMapping: SungsilConfig.GRADE_TO_SCORE_MAPPING.예체능우수인재,
        },
    ];

    // 성취도 -> 등급 변환 (진로선택 과목)
    readonly achievementToGradeConversionConfig: AchievementToGradeConfig[] = [
        {
            admissions: [SungsilConfig.ADMISSION_CODES.학생부우수자],
            units: [...SungsilConfig.ALL_UNITS],
            subjectSeparations: ['02'], // 진로선택
            achievementMapping: { A: 10, B: 9.5, C: 9 },
        },
        {
            admissions: [SungsilConfig.ADMISSION_CODES.논술우수자],
            units: [...SungsilConfig.ALL_UNITS],
            subjectSeparations: ['02'], // 진로선택
            achievementMapping: { A: 2, B: 1.9, C: 1.8 },
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...SungsilConfig.ALL_ADMISSIONS],
            units: [...SungsilConfig.ALL_UNITS],
        },
    ];

    // 교과별 가중치 점수 계산
    readonly subjectWeightedScoreConfig: SubjectWeightedScoreConfig[] = [
        {
            // 학생부우수자, 논술우수자 - 인문계열
            admissions: [...SungsilConfig.CAREER_APPLICABLE_ADMISSIONS],
            units: [SungsilConfig.UNIT_CODES.인문계열],
            subjectSeparations: ['01'],
            subjectWeights: { 국어: 0.35, 수학: 0.15, 영어: 0.35, 사회: 0.15, 한국사: 0.15 },
            multiplier: 8,
            truncateDigits: 5,
            finalTruncateDigits: 3,
        },
        {
            // 학생부우수자, 논술우수자 - 경상계열
            admissions: [...SungsilConfig.CAREER_APPLICABLE_ADMISSIONS],
            units: [SungsilConfig.UNIT_CODES.경상계열],
            subjectSeparations: ['01'],
            subjectWeights: { 국어: 0.2, 수학: 0.3, 영어: 0.35, 사회: 0.15, 한국사: 0.15 },
            multiplier: 8,
            truncateDigits: 5,
            finalTruncateDigits: 3,
        },
        {
            // 학생부우수자, 논술우수자 - 자유전공학부(인문)
            admissions: [...SungsilConfig.CAREER_APPLICABLE_ADMISSIONS],
            units: [SungsilConfig.UNIT_CODES.자유전공학부_인문],
            subjectSeparations: ['01'],
            subjectWeights: { 국어: 0.3, 수학: 0.2, 영어: 0.3, 사회: 0.2, 한국사: 0.2 },
            multiplier: 8,
            truncateDigits: 5,
            finalTruncateDigits: 3,
        },
        {
            // 학생부우수자, 논술우수자 - 자연계열, 자유전공학부(자연)
            admissions: [...SungsilConfig.CAREER_APPLICABLE_ADMISSIONS],
            units: [...SungsilConfig.SCIENCE_UNITS],
            subjectSeparations: ['01'],
            subjectWeights: { 국어: 0.15, 수학: 0.35, 영어: 0.25, 과학: 0.25 },
            multiplier: 8,
            truncateDigits: 5,
            finalTruncateDigits: 3,
        },
        {
            // 예체능우수인재 - 인문계열 (진로선택 없음)
            admissions: [SungsilConfig.ADMISSION_CODES.예체능우수인재],
            units: [SungsilConfig.UNIT_CODES.인문계열],
            subjectSeparations: ['01'],
            subjectWeights: { 국어: 0.35, 수학: 0.15, 영어: 0.35, 사회: 0.15, 한국사: 0.15 },
            multiplier: 10, // 예체능은 10 곱하기
            truncateDigits: 5,
            finalTruncateDigits: 3,
        },
    ];

    // 진로선택 과목 점수 계산 (학생부우수자, 논술우수자만)
    // 전제: AchievementToGradeConversionHandler와 GradeConversionHandler에서 이미 점수 변환 완료
    readonly careerSubjectScoreConfig: CareerSubjectScoreConfig[] = [
        {
            admissions: [SungsilConfig.ADMISSION_CODES.학생부우수자],
            units: [...SungsilConfig.ALL_UNITS],
            careerSubjectSeparationCode: '02',
            maxRatioByCount: [
                { minCount: 3, maxRatio: 20 },
                { minCount: 2, maxRatio: 18 },
                { minCount: 1, maxRatio: 16 },
            ],
            baseMaxRatio: 20,
            multiplier: 2,
            truncateDigits: 5,
            finalTruncateDigits: 3,
        },
        {
            admissions: [SungsilConfig.ADMISSION_CODES.논술우수자],
            units: [...SungsilConfig.ALL_UNITS],
            careerSubjectSeparationCode: '02',
            maxRatioByCount: [
                { minCount: 3, maxRatio: 20 },
                { minCount: 2, maxRatio: 18 },
                { minCount: 1, maxRatio: 16 },
            ],
            baseMaxRatio: 20,
            multiplier: 2,
            truncateDigits: 5,
            finalTruncateDigits: 3,
        },
    ];

    // 최종 점수 합산
    readonly finalScoreConfig: SungsilFinalScoreConfig[] = [
        {
            admissions: [...SungsilConfig.ALL_ADMISSIONS],
            units: [...SungsilConfig.ALL_UNITS],
        },
    ];
}
