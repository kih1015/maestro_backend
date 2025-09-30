import { ValidationConfig } from '../handlers/gcn-validation-handler';
import { ExcludedSubjectConfig } from '../handlers/excluded-subject-handler';
import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { SubjectSeparationConfig } from '../handlers/course-group-filter-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { RawScoreConversionConfig } from '../handlers/raw-score-conversion-handler';
import { WeightedFinalScoreConfig } from '../handlers/weighted-finalScore-calculation-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';

export class GacheonConfig {
    // === 상수 코드 매핑 ===
    private static readonly ADMISSION_CODES = {
        지역균형: '61',
        학생부우수자: '11',
        농어촌교과: '62',
        특성화고교: '76',
        실기우수자: '74',
    } as const;

    private static readonly UNIT_CODES = {
        인문계열: '46',
        자연계열: '20',
        의한약: '18',
        예체능계열: '29',
    } as const;

    // === 역매핑: 코드 -> 이름 ===
    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '61': '지역균형',
        '11': '학생부우수자',
        '62': '농어촌교과',
        '76': '특성화고교',
        '74': '실기우수자',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '46': '인문계열',
        '20': '자연계열',
        '18': '의한약',
        '29': '예체능계열',
    };

    /**
     * 전형 코드 -> 이름 매핑을 반환합니다.
     */
    static getAdmissionTypeMap(): Map<string, string> {
        const map = new Map<string, string>();
        Object.entries(this.ADMISSION_CODES).forEach(([name, code]) => {
            map.set(code, name);
        });
        return map;
    }

    /**
     * 모집단위 코드 -> 이름 매핑을 반환합니다.
     */
    static getRecruitmentUnitMap(): Map<string, string> {
        const map = new Map<string, string>();
        Object.entries(this.UNIT_CODES).forEach(([name, code]) => {
            map.set(code, name);
        });
        return map;
    }

    private static readonly SUBJECT_SEPARATION_CODES = {
        체육과목: '03',
        진로선택: '02',
        일반교과: '01',
    } as const;

    public static readonly SUBJECT_SEPARATION_CODE_TO_NAME: Record<string, string> = {
        '03': '체육/예술',
        '02': '진로',
        '01': '공통/일반',
    } as const;

    private static readonly ALL_ADMISSIONS_CODES = [
        this.ADMISSION_CODES.지역균형,
        this.ADMISSION_CODES.학생부우수자,
        this.ADMISSION_CODES.농어촌교과,
        this.ADMISSION_CODES.특성화고교,
        this.ADMISSION_CODES.실기우수자,
    ];

    private static readonly ALL_UNIT_CODES = [
        this.UNIT_CODES.인문계열,
        this.UNIT_CODES.자연계열,
        this.UNIT_CODES.의한약,
        this.UNIT_CODES.예체능계열,
    ];

    // === ValidationConfig 인터페이스 관련 설정 ===
    readonly validationConfig: ValidationConfig = {
        admissions: [...GacheonConfig.ALL_ADMISSIONS_CODES],
        units: [...GacheonConfig.ALL_UNIT_CODES],
    };

    // === SemesterReflectionConfig 인터페이스 관련 설정 ===
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...GacheonConfig.ALL_ADMISSIONS_CODES],
            units: [...GacheonConfig.ALL_UNIT_CODES],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true,
        },
    ];

    // === ExcludedSubjectConfig 인터페이스 관련 설정 ===
    readonly excludedSubjectConfig: ExcludedSubjectConfig[] = [
        {
            admissions: ['61'],
            units: ['46', '20', '18', '29'],
            commonExcludedSubjects: ['국어', '수학', '영어', '통합사회', '통합과학', '한국사'],
        },
    ];

    // === SubjectConfig 인터페이스 관련 설정 ===
    readonly subjectConfigs: SubjectConfig[] = [
        {
            admissions: ['11', '62', '76', '74'], // NOT_지역균형
            units: ['46'], // 인문계열
            reflectedSubjects: ['국어', '수학', '영어', '사회'],
        },
        {
            admissions: ['11', '62', '76', '74'], // NOT_지역균형
            units: ['20', '18'], // 자연계열, 의한약
            reflectedSubjects: ['국어', '수학', '영어', '과학'],
        },
        {
            admissions: ['11', '62', '76', '74'], // NOT_지역균형
            units: ['29'], // 예체능계열
            reflectedSubjects: ['국어', '영어'],
        },
        {
            admissions: ['61'], // 지역균형
            units: ['46', '20', '18', '29'], // 모든 계열
            reflectedSubjects: ['국어', '영어', '수학', '사회', '과학'],
        },
    ];

    // === CourseGroupConfig 인터페이스 관련 설정 ===
    readonly subjectSeparationsConfigs: SubjectSeparationConfig[] = [
        {
            admissions: ['61'], // 지역균형
            units: ['46', '20', '18', '29'], // 모든 계열
            subjectSeparations: ['01', '02'], // 일반교과, 진로선택
        },
        {
            admissions: ['11', '62', '76', '74'], // NOT_지역균형
            units: ['46', '20', '18', '29'], // 모든 계열
            subjectSeparations: ['01'], // 일반교과
        },
    ];

    // === 등급 환산 설정 ===
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: ['61'],
            units: ['46', '20', '18', '29'],
            subjectSeparations: ['01'],
            gradeMapping: {
                1: 100,
                2: 100,
                3: 100,
                4: 100,
                5: 99.5,
                6: 99.5,
                7: 99.5,
                8: 70,
                9: 70,
            },
        },
        // NOT_지역균형 - 인문/자연계열
        {
            admissions: ['11', '62', '76', '74'],
            units: ['46', '20'],
            subjectSeparations: ['01'],
            gradeMapping: {
                1: 100,
                2: 100,
                3: 99.5,
                4: 99.5,
                5: 99,
                6: 90,
                7: 90,
                8: 70,
                9: 70,
            },
        },
        // NOT_지역균형 - 의한약/예체능계열
        {
            admissions: ['11', '62', '76', '74'],
            units: ['18', '29'],
            subjectSeparations: ['01'],
            gradeMapping: {
                1: 100,
                2: 99.5,
                3: 99,
                4: 98.5,
                5: 98,
                6: 97.5,
                7: 85,
                8: 60,
                9: 30,
            },
        },
    ];

    // === 원점수 환산 설정 ===
    readonly rawScoreConversionConfig: RawScoreConversionConfig[] = [
        {
            admissions: ['61'],
            units: ['46', '20', '18', '29'],
            subjectSeparations: ['02'],
            rawScoreMapping: [
                { min: 80, score: 100 },
                { min: 60, score: 99.5 },
                { min: 0, score: 70 },
            ],
        },
    ];

    // === FinalScoreConfig 인터페이스 관련 설정 ===
    readonly finalScoreConfig: FinalScoreConfig[] = [
        {
            admissions: ['11', '62', '76', '74'], // NOT_지역균형
            units: ['46', '20', '18', '29'], // 모든 계열
        },
    ];

    readonly weightedFinalScoreConfig: WeightedFinalScoreConfig[] = [
        {
            admissions: ['61'], // 지역균형
            units: ['46', '20', '18', '29'], // 모든 계열
            generalWeight: 0.4, // 일반교과 40%
            careerWeight: 0.6, // 진로선택 60%
        },
    ];
}
