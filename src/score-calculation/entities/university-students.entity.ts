import { Student, StudentScoreResult, SubjectScoreCalculationDetail } from './student.entity';

const ADMISSION = {
    지역균형: '61',
    학생부우수자: '11',
    농어촌교과: '62',
    특성화고교: '76',
    실기우수자: '74',
} as const;

const UNIT = {
    인문계열: '46',
    자연계열: '20',
    의한약: '18',
    예체능계열: '29',
} as const;

const SUBJECT_SEPARATION = {
    체육과목: '03',
    진로선택: '02',
    일반교과: '01',
} as const;

const ALL_UNITS: string[] = [UNIT.인문계열, UNIT.자연계열, UNIT.의한약, UNIT.예체능계열];

const NOT_지역균형: string[] = [
    ADMISSION.학생부우수자,
    ADMISSION.농어촌교과,
    ADMISSION.특성화고교,
    ADMISSION.실기우수자,
];

const subjectFilterMap = new Map<[string[], string[]], string[]>([
    [
        [NOT_지역균형, [UNIT.인문계열]],
        ['국어', '수학', '영어', '사회'],
    ],
    [
        [NOT_지역균형, [UNIT.자연계열, UNIT.의한약]],
        ['국어', '수학', '영어', '과학'],
    ],
    [
        [NOT_지역균형, [UNIT.예체능계열]],
        ['국어', '영어'],
    ],
    [
        [[ADMISSION.지역균형], ALL_UNITS],
        ['국어', '영어', '수학', '사회', '과학'],
    ],
]);

function getReflectedSubjects(admission: string, unit: string): string[] {
    for (const [[types, units], subjects] of subjectFilterMap) {
        if (types.includes(admission) && units.includes(unit)) return subjects;
    }
    return [];
}

const courseGroupFilterMap = new Map<[string[], string[]], string[]>([
    [
        [[ADMISSION.지역균형], [...ALL_UNITS]],
        [SUBJECT_SEPARATION.일반교과, SUBJECT_SEPARATION.진로선택],
    ],
    [[[...NOT_지역균형], [...ALL_UNITS]], [SUBJECT_SEPARATION.일반교과]],
]);

function getReflectedCourseGroups(admission: string, unit: string): string[] {
    for (const [[admissions, units], groups] of courseGroupFilterMap) {
        if (admissions.includes(admission) && units.includes(unit)) return groups;
    }
    return [];
}

// ===== 환산 로직 (이전 계산기와 동일 규칙) =====
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

function isValidGrade(g?: number | null): g is number {
    return typeof g === 'number' && Number.isInteger(g) && g >= 1 && g <= 9;
}

function isValidRawScore(s?: number | null): s is number {
    return typeof s === 'number' && s >= 0 && s <= 100;
}

function convertNotJiguynHumNatByGrade(grade: number): number {
    if (grade <= 2) return 100;
    if (grade <= 4) return 99.5;
    if (grade === 5) return 99;
    if (grade <= 7) return 90;
    return 70;
}

function convertNotJiguynMedArtsByGrade(grade: number): number {
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

function convertJiguynGeneralByGrade(grade: number): number {
    if (grade <= 4) return 100;
    if (grade <= 7) return 99.5;
    return 70;
}

function convertJiguynCareerByRaw(raw: number): number {
    if (raw >= 80) return 100;
    if (raw >= 60) return 99.5;
    return 70;
}

function convertScore(input: ConvertScoreInput): ConvertScoreResult {
    const { admission, unit, courseGroup, grade, rawScore } = input;

    if (admission === ADMISSION.지역균형) {
        if (courseGroup === SUBJECT_SEPARATION.일반교과) {
            if (!isValidGrade(grade))
                return {
                    convertible: false,
                    score: 0,
                    reason: '등급 누락/범위 오류',
                };
            return {
                convertible: true,
                score: convertJiguynGeneralByGrade(grade),
                reason: '',
            };
        } else {
            if (!isValidRawScore(rawScore))
                return {
                    convertible: false,
                    score: 0,
                    reason: '원점수 누락/범위 오류',
                };
            return {
                convertible: true,
                score: convertJiguynCareerByRaw(rawScore),
                reason: '',
            };
        }
    }

    if (NOT_지역균형.includes(admission)) {
        if (!isValidGrade(grade))
            return {
                convertible: false,
                score: 0,
                reason: '등급 누락/범위 오류',
            };

        if (unit === UNIT.인문계열 || unit === UNIT.자연계열) {
            return {
                convertible: true,
                score: convertNotJiguynHumNatByGrade(grade),
                reason: '',
            };
        }

        if (unit === UNIT.의한약 || unit === UNIT.예체능계열) {
            return {
                convertible: true,
                score: convertNotJiguynMedArtsByGrade(grade),
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

export class GCNStudent extends Student {
    public override calculate(): void {
        const type = this.recruitmentTypeCode;
        const unitCode = this.recruitmentUnitCode;

        if (!['61', '11', '62', '76', '74'].includes(type)) {
            this.scoreResult = StudentScoreResult.create(this.id, 0, 0, '미지원 전형');
            return;
        }
        if (!['46', '20', '18', '29'].includes(unitCode)) {
            this.scoreResult = StudentScoreResult.create(this.id, 0, 0, '미지원 모집단위');
            return;
        }

        for (const s of this.subjectScores) {
            const include = this.isUpToThirdFirstSemester(s.grade, s.term);
            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                s,
                include,
                include ? null : '3학년 2학기 미반영',
            );
        }

        if (this.graduateGrade === '2') {
            for (const s of this.subjectScores) {
                if (s.grade === 2 && s.term === 2) {
                    s.calculationDetail = SubjectScoreCalculationDetail.create(
                        s.id,
                        s,
                        false,
                        '조기졸업자 2학년 2학기 미반영',
                    );
                }
            }
        }

        const allowedGroups = getReflectedSubjects(type, unitCode);
        for (const s of this.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) continue;
            const group = s.subjectGroup ?? '';
            if (allowedGroups.indexOf(group) === -1) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, s, false, '비반영 교과군');
            }
        }

        const reflectedCourseGroups = getReflectedCourseGroups(type, unitCode);
        for (const s of this.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) continue;
            const sep = s.subjectSeparationCode ?? '';
            if (!reflectedCourseGroups.includes(sep)) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, s, false, '비반영 교과 구분');
            }
        }

        // [지균 한정] 특정 공통 과목 미반영 처리
        if (type === ADMISSION.지역균형) {
            for (const s of this.subjectScores) {
                if (s.calculationDetail && !s.calculationDetail.isReflected) {
                    continue;
                }
                if (GCNStudent.COMMON_EXCLUDED_SUBJECTS.includes(s.subjectName)) {
                    s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, s, false, '특정 공통 과목 미반영');
                }
            }
        }

        // [환산] 점수 환산 및 환산 불가 처리
        for (const s of this.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) {
                continue;
            }
            const result = convertScore({
                admission: type,
                unit: unitCode,
                courseGroup: s.subjectSeparationCode ?? '',
                grade: s.rankingGrade ? Number(s.rankingGrade) : null,
                rawScore: Number(s.originalScore),
            });
            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                s,
                result.convertible,
                result.reason,
                result.score,
            );
        }

        if (type === ADMISSION.지역균형) {
            const generalPairs = this.subjectScores.filter(
                s => s.calculationDetail?.isReflected && s.subjectSeparationCode === SUBJECT_SEPARATION.일반교과,
            );
            const careerPairs = this.subjectScores.filter(
                s => s.calculationDetail?.isReflected && s.subjectSeparationCode === SUBJECT_SEPARATION.진로선택,
            );

            const genAvg = this.averageByUnit(
                generalPairs.map(s => ({
                    score: s.calculationDetail?.convertedScore ?? 0,
                    unit: this.unitValue(s.unit),
                })),
            );
            const carAvg = this.averageByUnit(
                careerPairs.map(s => ({
                    score: s.calculationDetail?.convertedScore ?? 0,
                    unit: this.unitValue(s.unit),
                })),
            );
            const finalScore = genAvg * 0.4 + carAvg * 0.6;
            this.scoreResult = StudentScoreResult.create(this.id, finalScore, 0, undefined);
            return;
        } else {
            const pairs = this.subjectScores.filter(s => s.calculationDetail?.isReflected);
            const finalScore = this.averageByUnit(
                pairs.map(p => ({
                    score: p.calculationDetail?.convertedScore ?? 0,
                    unit: this.unitValue(p.unit),
                })),
            );
            this.scoreResult = StudentScoreResult.create(this.id, finalScore, 0, undefined);
            return;
        }
    }

    private isUpToThirdFirstSemester(grade: number, term: number): boolean {
        if (grade < 3) return true;
        if (grade === 3 && term === 1) return true;
        return false;
    }

    private unitValue(unit?: string | null): number {
        const n = parseFloat(unit ?? '');
        return Number.isFinite(n) && n > 0 ? n : 1;
    }

    private averageByUnit(pairs: Array<{ score: number; unit: number }>): number {
        const numerator = pairs.reduce((acc, p) => acc + p.score * p.unit, 0);
        const denominator = pairs.reduce((acc, p) => acc + p.unit, 0);
        return denominator > 0 ? numerator / denominator : 0;
    }

    private static readonly COMMON_EXCLUDED_SUBJECTS: string[] = [
        '국어',
        '수학',
        '영어',
        '통합사회',
        '통합과학',
        '한국사',
    ];
}
