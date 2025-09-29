import { ValidationConfig } from '../handlers/gcn-validation-handler';
import { ExcludedSubjectConfig } from '../handlers/excluded-subject-handler';
import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { CourseGroupConfig } from '../handlers/course-group-filter-handler';
import { ScoreConversionConfig } from '../handlers/score-conversion-handler';

class GCNAdmissionConfig {
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

    private static readonly SUBJECT_SEPARATION_CODES = {
        체육과목: '03',
        진로선택: '02',
        일반교과: '01',
    } as const;

    // === ValidationConfig 인터페이스 관련 설정 ===
    readonly validationConfig: ValidationConfig = {
        supportedAdmissions: ['61', '11', '62', '76', '74'],
        supportedUnits: ['46', '20', '18', '29'],
    };

    // === ExcludedSubjectConfig 인터페이스 관련 설정 ===
    readonly excludedSubjectConfig: ExcludedSubjectConfig = {
        commonExcludedSubjects: ['국어', '수학', '영어', '통합사회', '통합과학', '한국사'],
        exclusionAdmissionCode: '61', // 지역균형 전형에서만 특정 과목 제외
    };

    // === FinalScoreConfig 인터페이스 관련 설정 ===
    readonly finalScoreConfig: FinalScoreConfig = {
        jiguynAdmissionCode: '61', // 지역균형 전형 코드
        generalSubjectCode: '01', // 일반교과 코드
        careerSubjectCode: '02', // 진로선택 코드
    };

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
    readonly courseGroupConfigs: CourseGroupConfig[] = [
        {
            admissions: ['61'], // 지역균형
            units: ['46', '20', '18', '29'], // 모든 계열
            reflectedCourseGroups: ['01', '02'], // 일반교과, 진로선택
        },
        {
            admissions: ['11', '62', '76', '74'], // NOT_지역균형
            units: ['46', '20', '18', '29'], // 모든 계열
            reflectedCourseGroups: ['01'], // 일반교과
        },
    ];

    // === ScoreConversionConfig 인터페이스 관련 설정 ===
    readonly scoreConversionConfigs: ScoreConversionConfig[] = [
        // 지역균형 - 일반교과 (등급 기반)
        {
            admissions: ['61'],
            units: ['46', '20', '18', '29'],
            courseGroups: ['01'],
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
        // 지역균형 - 진로선택 (원점수 기반)
        {
            admissions: ['61'],
            units: ['46', '20', '18', '29'],
            courseGroups: ['02'],
            gradeMapping: {},
            rawScoreMapping: [
                { min: 80, score: 100 },
                { min: 60, score: 99.5 },
                { min: 0, score: 70 },
            ],
        },
        // NOT_지역균형 - 인문/자연계열
        {
            admissions: ['11', '62', '76', '74'],
            units: ['46', '20'],
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

    // === 코드 변환 유틸리티 메서드들 ===
    getAdmissionCode(type: string): string {
        switch (type) {
            case '지역균형':
                return GCNAdmissionConfig.ADMISSION_CODES.지역균형;
            case '학생부우수자':
                return GCNAdmissionConfig.ADMISSION_CODES.학생부우수자;
            case '농어촌교과':
                return GCNAdmissionConfig.ADMISSION_CODES.농어촌교과;
            case '특성화고교':
                return GCNAdmissionConfig.ADMISSION_CODES.특성화고교;
            case '실기우수자':
                return GCNAdmissionConfig.ADMISSION_CODES.실기우수자;
            default:
                return '';
        }
    }

    getUnitCode(type: string): string {
        switch (type) {
            case '인문계열':
                return GCNAdmissionConfig.UNIT_CODES.인문계열;
            case '자연계열':
                return GCNAdmissionConfig.UNIT_CODES.자연계열;
            case '의한약':
                return GCNAdmissionConfig.UNIT_CODES.의한약;
            case '예체능계열':
                return GCNAdmissionConfig.UNIT_CODES.예체능계열;
            default:
                return '';
        }
    }

    getSubjectSeparationCode(type: string): string {
        switch (type) {
            case '체육과목':
                return GCNAdmissionConfig.SUBJECT_SEPARATION_CODES.체육과목;
            case '진로선택':
                return GCNAdmissionConfig.SUBJECT_SEPARATION_CODES.진로선택;
            case '일반교과':
                return GCNAdmissionConfig.SUBJECT_SEPARATION_CODES.일반교과;
            default:
                return '';
        }
    }
}

export default GCNAdmissionConfig;
