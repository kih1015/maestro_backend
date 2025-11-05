import { ValidationConfig } from '../handlers/student-validation-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';

export class TukoreaConfig {
    private static readonly ADMISSION_CODES = {
        논술우수자: '61',
        교과우수자: '11',
        지역균형: '62',
        특성화고교졸업자: '80',
    } as const;

    private static readonly UNIT_CODES = {
        공학계열: '46',
        경영학부: '20',
    } as const;

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '61': '논술우수자',
        '11': '교과우수자',
        '62': '지역균형',
        '80': '특성화고교졸업자',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '46': '공학계열',
        '20': '경영학부',
    };

    // 모든 전형
    private static readonly ALL_ADMISSIONS: string[] = Object.values(TukoreaConfig.ADMISSION_CODES);

    // 모든 모집단위
    private static readonly ALL_UNITS: string[] = Object.values(TukoreaConfig.UNIT_CODES);

    // 특성화고교졸업자 전형
    private static readonly VOCATIONAL_ADMISSION: string[] = [TukoreaConfig.ADMISSION_CODES.특성화고교졸업자];

    // 일반 전형 (특성화고교졸업자 제외)
    private static readonly GENERAL_ADMISSIONS: string[] = TukoreaConfig.ALL_ADMISSIONS.filter(
        a => !TukoreaConfig.VOCATIONAL_ADMISSION.includes(a),
    );

    readonly validationConfig: ValidationConfig = {
        admissions: [...TukoreaConfig.ALL_ADMISSIONS],
        units: [...TukoreaConfig.ALL_UNITS],
    };

    // 반영 학기 설정
    // 졸업자: 3학년 2학기까지
    // 졸업예정자: 3학년 1학기까지
    // 조기졸업자: 2학년 1학기까지
    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...TukoreaConfig.ALL_ADMISSIONS],
            units: [...TukoreaConfig.ALL_UNITS],
            maxGrade: 3,
            maxTerm: 1, // 졸업예정자: 3-1까지
            excludeEarlyGraduateSecondGradeSecondTerm: true, // 조기졸업자: 2-1까지
            isNotAppliedForGraduate: true, // 졸업자: 3-2까지
        },
    ];

    // 반영 교과
    // 공학계열: 국어, 영어, 수학, 과학
    static readonly ENGINEERING_SUBJECTS = ['국어', '영어', '수학', '과학'];

    // 경영학부: 국어, 영어, 수학, 사회, 과학 (사회 또는 과학 중 이수단위 많은 쪽)
    static readonly BUSINESS_SUBJECTS = ['국어', '영어', '수학', '사회', '과학'];

    // 특성화고교졸업자: 국어, 영어, 수학, 사회, 과학, '' (석차등급 있는 전과목)
    static readonly VOCATIONAL_SUBJECTS = ['국어', '영어', '수학', '사회', '과학', ''];

    // 석차등급 점수 매핑
    static readonly GRADE_SCORE_MAPPING: Record<number, number> = {
        1: 100,
        2: 99,
        3: 98,
        4: 97,
        5: 96,
        6: 94,
        7: 80,
        8: 60,
        9: 25,
    };

    // 성취도 점수 매핑 (진로선택과목)
    static readonly ACHIEVEMENT_SCORE_MAPPING: Record<string, number> = {
        A: 100,
        B: 99,
        C: 97,
    };

    // 2006 이전 졸업자 석차 백분율 점수 매핑
    // 석차백분율 구간별 점수
    // percentile < 4.00%: 100점 (상위 4% 이내)
    // 4.00% <= percentile < 11.00%: 99점
    // 11.00% <= percentile < 23.00%: 98점
    // 23.00% <= percentile < 40.00%: 97점
    // 40.00% <= percentile < 60.00%: 96점
    // 60.00% <= percentile < 77.00%: 94점
    // 77.00% <= percentile < 89.00%: 80점
    // 89.00% <= percentile < 96.00%: 60점
    // 96.00% <= percentile: 25점 (하위권)
    static readonly PERCENTILE_SCORE_MAPPING: Array<{ threshold: number; score: number }> = [
        { threshold: 4.0, score: 100 },
        { threshold: 11.0, score: 99 },
        { threshold: 23.0, score: 98 },
        { threshold: 40.0, score: 97 },
        { threshold: 60.0, score: 96 },
        { threshold: 77.0, score: 94 },
        { threshold: 89.0, score: 80 },
        { threshold: 96.0, score: 60 },
        { threshold: 100.0, score: 25 },
    ];

    // 논술우수자 전형
    static readonly ESSAY_ADMISSION = TukoreaConfig.ADMISSION_CODES.논술우수자;

    // 공학계열
    static readonly ENGINEERING_UNIT = TukoreaConfig.UNIT_CODES.공학계열;

    // 경영학부
    static readonly BUSINESS_UNIT = TukoreaConfig.UNIT_CODES.경영학부;

    // 특성화고교졸업자 전형
    static readonly VOCATIONAL_ADMISSION_CODE = TukoreaConfig.ADMISSION_CODES.특성화고교졸업자;
}
