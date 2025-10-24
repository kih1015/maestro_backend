import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { ValidationConfig } from '../handlers/gcn-validation-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { WeightApplyConfig } from '../handlers/weight-apply-handler';
import { FinalScoreFloorConfig } from '../handlers/final-score-floor-handler';
import { ZScoreGradeConfig } from '../handlers/zscore-grade-conversion-handler';

export class PusanConfig {
    private static readonly ADMISSION_CODES = {
        학생부교과: '61',
        논술: '11',
        실기실적_일반: '62',
        실기실적_특성화: '80',
    } as const;

    private static readonly UNIT_CODES = {
        ALL: '00', // 모집단위 구분 없음
    } as const;

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '61': '학생부교과',
        '11': '논술',
        '62': '실기/실적(일반)',
        '80': '실기/실적(특성화)',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '00': '전체',
    };

    // 일반전형 (특성화 제외)
    private static readonly GENERAL_ADMISSIONS: string[] = [
        PusanConfig.ADMISSION_CODES.학생부교과,
        PusanConfig.ADMISSION_CODES.논술,
        PusanConfig.ADMISSION_CODES.실기실적_일반,
    ];

    // 특성화고교전형
    private static readonly SPECIALIZED_ADMISSIONS: string[] = [PusanConfig.ADMISSION_CODES.실기실적_특성화];

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = [
        ...PusanConfig.GENERAL_ADMISSIONS,
        ...PusanConfig.SPECIALIZED_ADMISSIONS,
    ];

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(PusanConfig.UNIT_CODES);

    readonly validationConfig: ValidationConfig = {
        admissions: [...PusanConfig.ALL_ADMISSIONS],
        units: [...PusanConfig.ALL_UNITS],
    };

    // 반영 학기 설정
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...PusanConfig.ALL_ADMISSIONS],
            units: [...PusanConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1, // 졸업 예정자: 3-1
            excludeEarlyGraduateSecondGradeSecondTerm: true, // 조기 졸업(예정)자: 2-1
            isNotAppliedForGraduate: false, // 졸업자는 3-2까지 (별도 처리 필요)
        },
    ];

    // 반영 과목 설정
    readonly subjectConfigs: SubjectConfig[] = [
        // 일반전형: 국어, 수학, 영어, 사회, 과학
        {
            admissions: [...PusanConfig.GENERAL_ADMISSIONS],
            units: [...PusanConfig.ALL_UNITS],
            reflectedSubjects: ['국어', '수학', '영어', '사회', '과학'],
        },
        // 특성화고교전형: 국어, 수학, 영어, 사회, 과학, 전문교과
        {
            admissions: [...PusanConfig.SPECIALIZED_ADMISSIONS],
            units: [...PusanConfig.ALL_UNITS],
            reflectedSubjects: ['국어', '수학', '영어', '사회', '과학', '전문교과'],
        },
    ];

    // 석차등급 -> 점수 변환 (일반 과목)
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...PusanConfig.ALL_ADMISSIONS],
            units: [...PusanConfig.ALL_UNITS],
            subjectSeparations: ['01', '02'], // 공통, 일반선택, 진로선택
            gradeMapping: {
                1: 100,
                2: 99,
                3: 98,
                4: 97,
                5: 96,
                6: 95,
                7: 90,
                8: 60,
                9: 0,
            },
        },
    ];

    // 전문교과 Z점수 -> 등급 변환 (특성화고교)
    readonly zScoreGradeConfig: ZScoreGradeConfig[] = [
        {
            admissions: [...PusanConfig.SPECIALIZED_ADMISSIONS],
            units: [...PusanConfig.ALL_UNITS],
            subjectSeparations: ['03'], // 전문교과
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...PusanConfig.ALL_ADMISSIONS],
            units: [...PusanConfig.ALL_UNITS],
        },
    ];

    // 최종 점수 계산 설정 (가중평균)
    readonly finalScoreConfig: FinalScoreConfig[] = [
        {
            admissions: [...PusanConfig.ALL_ADMISSIONS],
            units: [...PusanConfig.ALL_UNITS],
        },
    ];

    // 전형별 교과배점 적용
    readonly weightApplyConfig: WeightApplyConfig[] = [
        // 학생부교과: 평균 × 80 / 100
        {
            admissions: [PusanConfig.ADMISSION_CODES.학생부교과],
            units: [...PusanConfig.ALL_UNITS],
            weight: 0.8,
        },
        // 논술: 평균 × 30 / 100
        {
            admissions: [PusanConfig.ADMISSION_CODES.논술],
            units: [...PusanConfig.ALL_UNITS],
            weight: 0.3,
        },
        // 실기/실적(일반, 특성화): 평균 × 20 / 100
        {
            admissions: [PusanConfig.ADMISSION_CODES.실기실적_일반, PusanConfig.ADMISSION_CODES.실기실적_특성화],
            units: [...PusanConfig.ALL_UNITS],
            weight: 0.2,
        },
    ];

    // 최종 점수 버림 설정 (소수점 다섯째 자리에서 버림 = 4자리까지 유지)
    readonly finalScoreFloorConfig: FinalScoreFloorConfig[] = [
        {
            admissions: [...PusanConfig.ALL_ADMISSIONS],
            units: [...PusanConfig.ALL_UNITS],
            digits: 4,
        },
    ];
}
