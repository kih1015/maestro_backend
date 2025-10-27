import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { SubjectSeparationConfig } from '../handlers/course-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { TopCourseSelectionConfig } from '../handlers/top-course-selection-handler';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';
import { WeightApplyConfig } from '../handlers/weight-apply-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';
import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { ValidationConfig } from '../handlers/student-validation-handler';
import { SubjectWeightedAverageConfig } from '../handlers/subject-weighted-average-handler';

export class KonkukConfig {
    private static readonly ADMISSION_CODES = {
        KU지역균형: '61',
        기회균형: '11',
        특성화고교졸업자: '62',
        특성화고졸재직자: '74',
        KU연기우수자: '80',
        KU체육특기자: '76',
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
        '61': 'KU지역균형',
        '11': '기회균형',
        '62': '특성화고교졸업자',
        '74': '특성화고졸재직자',
        '80': 'KU연기우수자',
        '76': 'KU체육특기자',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        ALL: '모두',
    };

    private static readonly ALL_ADMISSIONS_CODES = [
        this.ADMISSION_CODES.KU지역균형,
        this.ADMISSION_CODES.기회균형,
        this.ADMISSION_CODES.특성화고교졸업자,
        this.ADMISSION_CODES.특성화고졸재직자,
        this.ADMISSION_CODES.KU연기우수자,
        this.ADMISSION_CODES.KU체육특기자,
    ];

    private static readonly STANDARD_ADMISSIONS = [
        this.ADMISSION_CODES.KU지역균형,
        this.ADMISSION_CODES.기회균형,
        this.ADMISSION_CODES.특성화고교졸업자,
        this.ADMISSION_CODES.특성화고졸재직자,
    ];

    private static readonly ARTS_SPORTS_ADMISSIONS = [
        this.ADMISSION_CODES.KU연기우수자,
        this.ADMISSION_CODES.KU체육특기자,
    ];

    private static readonly ALL_UNIT_CODES: string[] = Object.values(KonkukConfig.UNIT_CODES);

    readonly validationConfig: ValidationConfig = {
        admissions: [...KonkukConfig.ALL_ADMISSIONS_CODES],
        units: [...KonkukConfig.ALL_UNIT_CODES],
    };

    // 반영 학기 설정
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...KonkukConfig.ALL_ADMISSIONS_CODES],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true,
            isNotAppliedForGraduate: true, // 졸업예정자는 3-1까지, 졸업자는 3-2까지
        },
    ];

    // 반영 과목 설정
    readonly subjectConfigs: SubjectConfig[] = [
        // KU지역균형, 기회균형, 특성화고교졸업자, 특성화고졸재직자
        {
            admissions: [...KonkukConfig.STANDARD_ADMISSIONS],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            reflectedSubjects: ['국어', '수학', '영어', '과학', '사회', '한국사'],
        },
        // KU연기우수자, KU체육특기자
        {
            admissions: [...KonkukConfig.ARTS_SPORTS_ADMISSIONS],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            reflectedSubjects: ['국어', '영어'],
        },
    ];

    // 과목 구분 필터 설정
    readonly subjectSeparationsConfigs: SubjectSeparationConfig[] = [
        // 표준 전형 - 공통/일반만 (진로선택 제외)
        {
            admissions: [...KonkukConfig.STANDARD_ADMISSIONS],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '03'], // 공통/일반만
        },
        // 예체능 전형 - 공통/일반 + 진로선택
        {
            admissions: [...KonkukConfig.ARTS_SPORTS_ADMISSIONS],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '02', '03'], // 공통/일반 + 진로선택
        },
    ];

    // 등급 환산 설정 (공통/일반 과목)
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...KonkukConfig.ALL_ADMISSIONS_CODES],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '03'], // 공통/일반
            gradeMapping: {
                1: 10,
                2: 9.97,
                3: 9.94,
                4: 9.9,
                5: 9.86,
                6: 9.8,
                7: 8,
                8: 6,
                9: 0,
            },
        },
    ];

    // 성취도 환산 설정 (진로선택 과목)
    readonly achievementToGradeConfig: AchievementToGradeConfig[] = [
        {
            admissions: [...KonkukConfig.ARTS_SPORTS_ADMISSIONS],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            subjectSeparations: ['02'], // 진로선택과목
            achievementMapping: {
                A: 10,
                B: 9.9,
                C: 8,
            },
        },
    ];

    // 상위 과목 선택 설정 (진로선택 상위 3과목)
    readonly topCourseSelectionConfig: TopCourseSelectionConfig[] = [
        {
            admissions: [...KonkukConfig.ARTS_SPORTS_ADMISSIONS],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            subjectSeparations: ['02'], // 진로선택과목
            topCourseCount: 3, // 상위 3개 과목
        },
    ];

    // 이수가중평균 설정 (표준 전형용)
    readonly finalScoreConfig: FinalScoreConfig[] = [
        {
            admissions: [...KonkukConfig.STANDARD_ADMISSIONS],
            units: [...KonkukConfig.ALL_UNIT_CODES],
        },
    ];

    // 과목별 가중평균 설정 (국어 50%, 영어 50%)
    readonly subjectWeightedAverageConfig: SubjectWeightedAverageConfig[] = [
        {
            admissions: [...KonkukConfig.ARTS_SPORTS_ADMISSIONS],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            subjectWeights: {
                국어: 0.5,
                영어: 0.5,
            },
        },
    ];

    // 가중치 적용 설정 (마지막 * 10)
    readonly weightApplyConfig: WeightApplyConfig[] = [
        {
            admissions: [...KonkukConfig.ALL_ADMISSIONS_CODES],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            weight: 100,
        },
    ];

    // 최종 점수 반올림 설정
    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...KonkukConfig.ALL_ADMISSIONS_CODES],
            units: [...KonkukConfig.ALL_UNIT_CODES],
            digits: 3,
        },
    ];
}
