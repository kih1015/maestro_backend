import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { ValidationConfig } from '../handlers/student-validation-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { TopCourseSelectionConfig } from '../handlers/top-course-selection-handler';
import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { PercentileGradeConfig } from '../handlers/percentile-grade-conversion-handler';
import { AverageScoreTo1000Config } from '../handlers/average-score-to-1000-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-score-rounding-handler';
import { DefaultScoreFillerConfig } from '../handlers/default-score-filler-handler';

export class SungkyulConfig {
    private static readonly ADMISSION_CODES = {
        전형11: '11',
        전형12: '12',
        전형61: '61',
        전형62: '62',
        전형72: '72',
        전형74: '74',
        전형75: '75',
        전형76: '76',
        전형78: '78',
        전형80: '80',
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
        '01': '학생부교과',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        ALL: '전체',
    };

    static readonly SUBJECT_SEPARATION_CODE_TO_NAME: Record<string, string> = {
        '01': '공통과목',
        '03': '일반선택',
    };

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = Object.values(SungkyulConfig.ADMISSION_CODES);

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(SungkyulConfig.UNIT_CODES);

    readonly validationConfig: ValidationConfig = {
        admissions: [...SungkyulConfig.ALL_ADMISSIONS],
        units: [...SungkyulConfig.ALL_UNITS],
    };

    // 반영 학기 설정: 3-1학기까지 (졸업자 포함)
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: true,
            isNotAppliedForGraduate: false, // 졸업자도 3-1학기까지
        },
    ];

    // 반영 교과: 국어, 수학, 영어, 사회, 과학, 한국사
    readonly subjectGroupFilterConfig: SubjectConfig[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
            reflectedSubjects: ['국어', '수학', '영어', '사회', '과학', '한국사'],
        },
    ];

    // 석차등급 -> 점수 변환 (2008년 이후 졸업자)
    // 1등급=5점, 2등급=4.5점, ..., 9등급=1점
    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'], // 공통, 일반선택
            gradeMapping: {
                1: 5,
                2: 4.5,
                3: 4,
                4: 3.5,
                5: 3,
                6: 2.5,
                7: 2,
                8: 1.5,
                9: 1,
            },
        },
    ];

    // 2008년 이전 졸업자: 백분율에 의한 환산 등급
    readonly percentileGradeConfig: PercentileGradeConfig[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
            subjectSeparations: ['01', '03'], // 공통, 일반선택
            graduateYearThreshold: 2008, // 2008년 이전 졸업자에게만 적용
            gradeScoreMapping: {
                1: 5,
                2: 4.5,
                3: 4,
                4: 3.5,
                5: 3,
                6: 2.5,
                7: 2,
                8: 1.5,
                9: 1,
            },
            roundDigits: 2,
        },
    ];

    // 상위 12과목만 반영
    readonly topCourseSelectionConfig: TopCourseSelectionConfig[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
            subjectSeparations: ['01', '02', '03'], // 공통, 일반선택
            topCourseCount: 12,
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
        },
    ];

    // 기본 과목 추가: 12개 미만일 경우 기본 점수로 채움
    readonly defaultScoreFillerConfig: DefaultScoreFillerConfig[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
            subjectSeparations: ['01', '02', '03'], // 공통, 일반선택
            targetCourseCount: 12,
            defaultGrade: 9, // 9등급
            defaultUnit: 1, // 이수단위 1
        },
    ];

    // 이수가중 평균 계산
    readonly finalScoreCalculationConfig: FinalScoreConfig[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
        },
    ];

    // 최종 점수 반올림 설정 (소수점 넷째 자리에서 반올림)
    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
            digits: 2,
        },
    ];

    // 평균 점수를 1000점 만점으로 환산
    readonly averageScoreTo1000Config: AverageScoreTo1000Config[] = [
        {
            admissions: [...SungkyulConfig.ALL_ADMISSIONS],
            units: [...SungkyulConfig.ALL_UNITS],
        },
    ];
}
