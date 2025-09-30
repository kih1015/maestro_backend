import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface WeightedFinalScoreConfig {
    readonly admissions: string[];
    readonly units: string[];
    readonly generalWeight: number;
    readonly careerWeight: number;
}

export class WeightedFinalScoreCalculationHandler extends BaseScoreHandler {
    private static readonly GENERAL_SUBJECT_CODE = '01';
    private static readonly CAREER_SUBJECT_CODE = '02';

    constructor(private readonly config: WeightedFinalScoreConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        const config = this.findConfig(type, unitCode);
        if (!config) {
            return;
        }

        const generalSubjects = student.subjectScores.filter(
            s =>
                s.calculationDetail?.isReflected &&
                s.subjectSeparationCode === WeightedFinalScoreCalculationHandler.GENERAL_SUBJECT_CODE,
        );
        const careerSubjects = student.subjectScores.filter(
            s =>
                s.calculationDetail?.isReflected &&
                s.subjectSeparationCode === WeightedFinalScoreCalculationHandler.CAREER_SUBJECT_CODE,
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

        const finalScore = generalAverage * config.generalWeight + careerAverage * config.careerWeight;
        student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
    }

    private findConfig(admission: string, unit: string): WeightedFinalScoreConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
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
