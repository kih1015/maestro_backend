import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult, SubjectScoreCalculationDetail } from '../entities/student.entity';
import { GCNAdmissionRules } from '../entities/gcn-admission-rules';

export class GCNValidationHandler extends BaseScoreHandler {
    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        if (!['61', '11', '62', '76', '74'].includes(type)) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '미지원 전형');
            context.shouldContinue = false;
            return;
        }
        if (!['46', '20', '18', '29'].includes(unitCode)) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '미지원 모집단위');
            context.shouldContinue = false;
            return;
        }
    }
}

export class SemesterReflectionHandler extends BaseScoreHandler {
    protected process(context: ScoreCalculationContext): void {
        const student = context.student;

        for (const s of student.subjectScores) {
            const include = this.isUpToThirdFirstSemester(s.grade, s.term);
            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                s,
                include,
                include ? null : '3학년 2학기 미반영',
            );
        }

        if (student.graduateGrade === '2') {
            for (const s of student.subjectScores) {
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
    }

    private isUpToThirdFirstSemester(grade: number, term: number): boolean {
        if (grade < 3) return true;
        return grade === 3 && term === 1;
    }
}

export class SubjectGroupFilterHandler extends BaseScoreHandler {
    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        const allowedGroups = GCNAdmissionRules.getReflectedSubjects(type, unitCode);
        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) continue;
            const group = s.subjectGroup ?? '';
            if (allowedGroups.indexOf(group) === -1) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, s, false, '비반영 교과군');
            }
        }
    }
}

export class CourseGroupFilterHandler extends BaseScoreHandler {
    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        const reflectedCourseGroups = GCNAdmissionRules.getReflectedCourseGroups(type, unitCode);
        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) continue;
            const sep = s.subjectSeparationCode ?? '';
            if (!reflectedCourseGroups.includes(sep)) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, s, false, '비반영 교과 구분');
            }
        }
    }
}

export class ExcludedSubjectHandler extends BaseScoreHandler {
    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;

        if (type === '61') {
            for (const s of student.subjectScores) {
                if (s.calculationDetail && !s.calculationDetail.isReflected) {
                    continue;
                }
                if (GCNAdmissionRules.COMMON_EXCLUDED_SUBJECTS.includes(s.subjectName)) {
                    s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, s, false, '특정 공통 과목 미반영');
                }
            }
        }
    }
}

export class ScoreConversionHandler extends BaseScoreHandler {
    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) {
                continue;
            }
            const result = GCNAdmissionRules.convertScore({
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
    }
}

export class FinalScoreCalculationHandler extends BaseScoreHandler {
    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;

        if (type === '61') {
            const generalPairs = student.subjectScores.filter(
                s => s.calculationDetail?.isReflected && s.subjectSeparationCode === '01',
            );
            const careerPairs = student.subjectScores.filter(
                s => s.calculationDetail?.isReflected && s.subjectSeparationCode === '02',
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
            student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
        } else {
            const pairs = student.subjectScores.filter(s => s.calculationDetail?.isReflected);
            const finalScore = this.averageByUnit(
                pairs.map(p => ({
                    score: p.calculationDetail?.convertedScore ?? 0,
                    unit: this.unitValue(p.unit),
                })),
            );
            student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
        }
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
}
