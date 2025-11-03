import { ValidationConfig } from '../handlers/student-validation-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';

export class YonseiConfig {
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
        특기자전형: '80',
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
        '80': '특기자전형',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '00': '전체',
    };

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = [
        '01',
        '02',
        '03',
        '04',
        '05',
        ...Object.values(YonseiConfig.ADMISSION_CODES),
    ];

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(YonseiConfig.UNIT_CODES);

    // 특기자 전형
    private static readonly TALENT_ADMISSION: string[] = [YonseiConfig.ADMISSION_CODES.특기자전형];

    // 일반 전형 (특기자 제외)
    private static readonly GENERAL_ADMISSIONS: string[] = YonseiConfig.ALL_ADMISSIONS.filter(
        a => !YonseiConfig.TALENT_ADMISSION.includes(a),
    );

    readonly validationConfig: ValidationConfig = {
        admissions: [...YonseiConfig.ALL_ADMISSIONS],
        units: [...YonseiConfig.ALL_UNITS],
    };

    // 반영 학기 설정
    // 졸업자: 모든학기
    // 재학생: 3학년 1학기
    // 조졸자: 2학년 1학기
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...YonseiConfig.ALL_ADMISSIONS],
            units: [...YonseiConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1, // 재학생: 3-1까지
            excludeEarlyGraduateSecondGradeSecondTerm: true, // 조졸자: 2-1까지
            isNotAppliedForGraduate: true, // 졸업자: 3-2까지
        },
    ];

    // 공통 교과 과목명
    static readonly COMMON_SUBJECTS = [
        '국어',
        '국어Ⅰ',
        '국어Ⅱ',
        '기초수학',
        '수학',
        '수학Ⅰ',
        '기초영어',
        '영어',
        '사회',
        '도덕',
        '한국사',
        '한국사Ⅰ',
        '한국사Ⅱ',
        '과학Ⅰ',
        '과학Ⅱ',
        '과학',
    ];

    // 반영과목 A: 국어, 수학, 영어, 사회, 과학
    static readonly SUBJECT_GROUP_A = ['국어', '수학', '영어', '사회', '과학'];

    // 특기자 전형 반영교과: 국어, 영어, 수학, 체육
    static readonly TALENT_SUBJECTS = ['국어', '영어', '수학', '체육'];

    // 등급 점수 매핑
    static readonly GRADE_SCORE_MAPPING: Record<number, number> = {
        1: 100,
        2: 95,
        3: 87.5,
        4: 75,
        5: 60,
        6: 40,
        7: 25,
        8: 12.5,
        9: 5,
    };

    // Z점수 -> 석차백분율 매핑
    static readonly Z_SCORE_TO_PERCENTILE: Record<string, number> = {
        '3.0': 0.0013,
        '2.9': 0.0019,
        '2.8': 0.0026,
        '2.7': 0.0035,
        '2.6': 0.0047,
        '2.5': 0.0062,
        '2.4': 0.0082,
        '2.3': 0.0107,
        '2.2': 0.0139,
        '2.1': 0.0179,
        '2.0': 0.0228,
        '1.9': 0.0287,
        '1.8': 0.0359,
        '1.7': 0.0446,
        '1.6': 0.0548,
        '1.5': 0.0668,
        '1.4': 0.0808,
        '1.3': 0.0968,
        '1.2': 0.1151,
        '1.1': 0.1357,
        '1.0': 0.1587,
        '0.9': 0.1841,
        '0.8': 0.2119,
        '0.7': 0.242,
        '0.6': 0.2743,
        '0.5': 0.3085,
        '0.4': 0.3446,
        '0.3': 0.3821,
        '0.2': 0.4207,
        '0.1': 0.4602,
        '0.0': 0.5,
        '-0.1': 0.5398,
        '-0.2': 0.5793,
        '-0.3': 0.6179,
        '-0.4': 0.6554,
        '-0.5': 0.6915,
        '-0.6': 0.7257,
        '-0.7': 0.758,
        '-0.8': 0.7881,
        '-0.9': 0.8159,
        '-1.0': 0.8413,
        '-1.1': 0.8643,
        '-1.2': 0.8849,
        '-1.3': 0.9032,
        '-1.4': 0.9192,
        '-1.5': 0.9332,
        '-1.6': 0.9452,
        '-1.7': 0.9554,
        '-1.8': 0.9641,
        '-1.9': 0.9713,
        '-2.0': 0.9772,
        '-2.1': 0.9821,
        '-2.2': 0.9861,
        '-2.3': 0.9893,
        '-2.4': 0.9918,
        '-2.5': 0.9938,
        '-2.6': 0.9953,
        '-2.7': 0.9965,
        '-2.8': 0.9974,
        '-2.9': 0.9981,
        '-3.0': 0.9987,
    };

    // 등급별 최소 석차백분율 (저점 보정용)
    static readonly GRADE_MIN_PERCENTILE: Record<number, number> = {
        1: 0.04,
        2: 0.11,
        3: 0.23,
        4: 0.4,
        5: 0.6,
        6: 0.77,
        7: 0.89,
        8: 0.96,
    };

    // 진로선택 성취도 점수 매핑
    static readonly ACHIEVEMENT_SCORE_MAPPING: Record<string, number> = {
        A: 100,
        B: 75,
        C: 50,
    };

    // 전문교과 점수 매핑
    static readonly VOCATIONAL_SCORE_MAPPING: Record<string, number> = {
        A: 100,
        B: 100,
        C: 75,
        D: 75,
        E: 50,
    };

    // 특기자 전형 등급/전문교과 점수 매핑
    static readonly TALENT_GRADE_SCORE_MAPPING: Record<number | string, number> = {
        1: 100,
        2: 90,
        3: 90,
        4: 80,
        5: 80,
        6: 80,
        7: 70,
        8: 70,
        9: 60,
        A: 100,
        B: 90,
        C: 80,
        D: 70,
        E: 60,
    };

    // 특기자 전형 성취도 점수 매핑
    static readonly TALENT_ACHIEVEMENT_SCORE_MAPPING: Record<string, number> = {
        A: 100,
        B: 80,
        C: 60,
    };
}
