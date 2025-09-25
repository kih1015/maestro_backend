interface ConvertScoreInput {
    admission: string;
    unit: string;
    courseGroup: string;
    grade: number | null;
    rawScore: number | null;
}

interface ConvertScoreResult {
    convertible: boolean;
    score: number;
    reason: string;
}

export class GCNAdmissionRules {
    private static readonly ADMISSION = {
        지역균형: '61',
        학생부우수자: '11',
        농어촌교과: '62',
        특성화고교: '76',
        실기우수자: '74',
    } as const;

    private static readonly UNIT = {
        인문계열: '46',
        자연계열: '20',
        의한약: '18',
        예체능계열: '29',
    } as const;

    private static readonly SUBJECT_SEPARATION = {
        체육과목: '03',
        진로선택: '02',
        일반교과: '01',
    } as const;

    private static readonly ALL_UNITS: string[] = [
        GCNAdmissionRules.UNIT.인문계열,
        GCNAdmissionRules.UNIT.자연계열,
        GCNAdmissionRules.UNIT.의한약,
        GCNAdmissionRules.UNIT.예체능계열,
    ];

    private static readonly NOT_지역균형: string[] = [
        GCNAdmissionRules.ADMISSION.학생부우수자,
        GCNAdmissionRules.ADMISSION.농어촌교과,
        GCNAdmissionRules.ADMISSION.특성화고교,
        GCNAdmissionRules.ADMISSION.실기우수자,
    ];

    private static readonly subjectFilterMap = new Map<[string[], string[]], string[]>([
        [
            [GCNAdmissionRules.NOT_지역균형, [GCNAdmissionRules.UNIT.인문계열]],
            ['국어', '수학', '영어', '사회'],
        ],
        [
            [GCNAdmissionRules.NOT_지역균형, [GCNAdmissionRules.UNIT.자연계열, GCNAdmissionRules.UNIT.의한약]],
            ['국어', '수학', '영어', '과학'],
        ],
        [
            [GCNAdmissionRules.NOT_지역균형, [GCNAdmissionRules.UNIT.예체능계열]],
            ['국어', '영어'],
        ],
        [
            [[GCNAdmissionRules.ADMISSION.지역균형], GCNAdmissionRules.ALL_UNITS],
            ['국어', '영어', '수학', '사회', '과학'],
        ],
    ]);

    private static readonly courseGroupFilterMap = new Map<[string[], string[]], string[]>([
        [
            [[GCNAdmissionRules.ADMISSION.지역균형], [...GCNAdmissionRules.ALL_UNITS]],
            [GCNAdmissionRules.SUBJECT_SEPARATION.일반교과, GCNAdmissionRules.SUBJECT_SEPARATION.진로선택],
        ],
        [
            [[...GCNAdmissionRules.NOT_지역균형], [...GCNAdmissionRules.ALL_UNITS]],
            [GCNAdmissionRules.SUBJECT_SEPARATION.일반교과],
        ],
    ]);

    static readonly COMMON_EXCLUDED_SUBJECTS: string[] = ['국어', '수학', '영어', '통합사회', '통합과학', '한국사'];

    static getReflectedSubjects(admission: string, unit: string): string[] {
        for (const [[types, units], subjects] of GCNAdmissionRules.subjectFilterMap) {
            if (types.includes(admission) && units.includes(unit)) return subjects;
        }
        return [];
    }

    static getReflectedCourseGroups(admission: string, unit: string): string[] {
        for (const [[admissions, units], groups] of GCNAdmissionRules.courseGroupFilterMap) {
            if (admissions.includes(admission) && units.includes(unit)) return groups;
        }
        return [];
    }

    static convertScore(input: ConvertScoreInput): ConvertScoreResult {
        const { admission, unit, courseGroup, grade, rawScore } = input;

        if (admission === GCNAdmissionRules.ADMISSION.지역균형) {
            if (courseGroup === GCNAdmissionRules.SUBJECT_SEPARATION.일반교과) {
                if (!GCNAdmissionRules.isValidGrade(grade))
                    return {
                        convertible: false,
                        score: 0,
                        reason: '등급 누락/범위 오류',
                    };
                return {
                    convertible: true,
                    score: GCNAdmissionRules.convertJiguynGeneralByGrade(grade),
                    reason: '',
                };
            } else {
                if (!GCNAdmissionRules.isValidRawScore(rawScore))
                    return {
                        convertible: false,
                        score: 0,
                        reason: '원점수 누락/범위 오류',
                    };
                return {
                    convertible: true,
                    score: GCNAdmissionRules.convertJiguynCareerByRaw(rawScore),
                    reason: '',
                };
            }
        }

        if (GCNAdmissionRules.NOT_지역균형.includes(admission)) {
            if (!GCNAdmissionRules.isValidGrade(grade))
                return {
                    convertible: false,
                    score: 0,
                    reason: '등급 누락/범위 오류',
                };

            if (unit === GCNAdmissionRules.UNIT.인문계열 || unit === GCNAdmissionRules.UNIT.자연계열) {
                return {
                    convertible: true,
                    score: GCNAdmissionRules.convertNotJiguynHumNatByGrade(grade),
                    reason: '',
                };
            }

            if (unit === GCNAdmissionRules.UNIT.의한약 || unit === GCNAdmissionRules.UNIT.예체능계열) {
                return {
                    convertible: true,
                    score: GCNAdmissionRules.convertNotJiguynMedArtsByGrade(grade),
                    reason: '',
                };
            }

            return {
                convertible: false,
                score: 0,
                reason: '모집단위 코드 미정의',
            };
        }

        return {
            convertible: false,
            score: 0,
            reason: '모집전형 코드 미정의',
        };
    }

    private static isValidGrade(g?: number | null): g is number {
        return typeof g === 'number' && Number.isInteger(g) && g >= 1 && g <= 9;
    }

    private static isValidRawScore(s?: number | null): s is number {
        return typeof s === 'number' && s >= 0 && s <= 100;
    }

    private static convertNotJiguynHumNatByGrade(grade: number): number {
        if (grade <= 2) return 100;
        if (grade <= 4) return 99.5;
        if (grade === 5) return 99;
        if (grade <= 7) return 90;
        return 70;
    }

    private static convertNotJiguynMedArtsByGrade(grade: number): number {
        switch (grade) {
            case 1:
                return 100;
            case 2:
                return 99.5;
            case 3:
                return 99;
            case 4:
                return 98.5;
            case 5:
                return 98;
            case 6:
                return 97.5;
            case 7:
                return 85;
            case 8:
                return 60;
            case 9:
                return 30;
            default:
                return 0;
        }
    }

    private static convertJiguynGeneralByGrade(grade: number): number {
        if (grade <= 4) return 100;
        if (grade <= 7) return 99.5;
        return 70;
    }

    private static convertJiguynCareerByRaw(raw: number): number {
        if (raw >= 80) return 100;
        if (raw >= 60) return 99.5;
        return 70;
    }
}
