import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';

export interface FinalScoreConfig {
    readonly jiguynAdmissionCode: string;
    readonly generalSubjectCode: string;
    readonly careerSubjectCode: string;
}

export class FinalScoreCalculationHandler extends BaseScoreHandler {
    constructor(private readonly config: FinalScoreConfig) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;

        if (this.isJiguynAdmission(type)) {
            // 특별 전형: 일반교과 40% + 진로선택 60%
            const finalScore = this.calculateJiguynFinalScore(student);
            student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
        } else {
            // 기타 전형: 전체 과목 평균
            const finalScore = this.calculateGeneralFinalScore(student);
            student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
        }
    }

    private isJiguynAdmission(admission: string): boolean {
        return admission === this.config.jiguynAdmissionCode;
    }

    private calculateJiguynFinalScore(student: Student): number {
        const generalSubjects = student.subjectScores.filter(
            s => s.calculationDetail?.isReflected && s.subjectSeparationCode === this.config.generalSubjectCode,
        );
        const careerSubjects = student.subjectScores.filter(
            s => s.calculationDetail?.isReflected && s.subjectSeparationCode === this.config.careerSubjectCode,
        );

        const generalAverage = this.calculateWeightedAverage(
            generalSubjects.map(s => ({
                score: s.calculationDetail?.convertedScore ?? 0,
                unit: this.parseUnit(s.unit),
            })),
        );
        const careerAverage = this.calculateWeightedAverage(
            careerSubjects.map(s => ({
                score: s.calculationDetail?.convertedScore ?? 0,
                unit: this.parseUnit(s.unit),
            })),
        );

        // 특별 전형 가중치: 일반교과 40%, 진로선택 60%
        return generalAverage * 0.4 + careerAverage * 0.6;
    }

    private calculateGeneralFinalScore(student: Student): number {
        const reflectedSubjects = student.subjectScores.filter(s => s.calculationDetail?.isReflected);
        return this.calculateWeightedAverage(
            reflectedSubjects.map(s => ({
                score: s.calculationDetail?.convertedScore ?? 0,
                unit: this.parseUnit(s.unit),
            })),
        );
    }

    private parseUnit(unit?: string | null): number {
        const parsedUnit = parseFloat(unit ?? '');
        return Number.isFinite(parsedUnit) && parsedUnit > 0 ? parsedUnit : 1;
    }

    private calculateWeightedAverage(pairs: Array<{ score: number; unit: number }>): number {
        const totalWeightedScore = pairs.reduce((acc, p) => acc + p.score * p.unit, 0);
        const totalWeight = pairs.reduce((acc, p) => acc + p.unit, 0);
        return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    }
}
