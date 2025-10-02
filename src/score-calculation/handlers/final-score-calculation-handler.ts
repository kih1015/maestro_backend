import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface FinalScoreConfig {
    readonly admissions: string[];
    readonly units: string[];
}

export class FinalScoreCalculationHandler extends BaseScoreHandler {
    protected readonly handlerType = 'FinalScoreCalculationHandler';
    private readonly subject = '이수가중평균 계산';
    private readonly description = '이수가중평균 점수를 계산합니다.';

    constructor(private readonly config: FinalScoreConfig[]) {
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

        const reflectedSubjects = student.subjectScores.filter(s => s.calculationDetail?.isReflected);
        const finalScore = this.calculateWeightedAverage(
            reflectedSubjects.map(s => ({
                score: s.calculationDetail?.convertedScore ?? 0,
                unit: this.parseUnit(s.unit),
            })),
        );
        student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
    }

    private findConfig(admission: string, unit: string): FinalScoreConfig | undefined {
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

    public getInfo(): HandlerInfo {
        return {
            type: 'calc',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions.map(code => GacheonConfig.ADMISSION_CODE_TO_NAME[code]),
                units: c.units.map(code => GacheonConfig.UNIT_CODE_TO_NAME[code] ?? code),
                formula: `\\frac{\\sum(환산 점수 \\times 이수 단위)}{\\sum(이수 단위)}`,
            })),
        };
    }
}
