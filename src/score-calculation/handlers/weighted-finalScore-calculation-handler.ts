import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface WeightedFinalScoreConfig {
    readonly admissions: string[];
    readonly units: string[];
    readonly generalWeight: number;
    readonly careerWeight: number;
}

export class WeightedFinalScoreCalculationHandler extends BaseScoreHandler {
    protected readonly handlerType = 'WeightedFinalScoreCalculationHandler';
    private readonly subject = '가중 이수가중평균 계산';
    private readonly description = '일반/전문 교과에 가중치를 적용한 이수가중평균을 계산합니다.';

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

    public getInfo(): HandlerInfo {
        return {
            type: 'calc',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions.map(code => GacheonConfig.ADMISSION_CODE_TO_NAME[code]),
                units: c.units.map(code => GacheonConfig.UNIT_CODE_TO_NAME[code]),
                mappingTable: [
                    { key: '일반교과 가중치', value: `${c.generalWeight}` },
                    { key: '전문교과 가중치', value: `${c.careerWeight}` },
                ],
                formula: `\\frac{\\sum(일반교과 변환점수 \\times 단위수)}{\\sum(일반교과 단위수)} \\times ${c.generalWeight} + \\frac{\\sum(전문교과 변환점수 \\times 단위수)}{\\sum(전문교과 단위수)} \\times ${c.careerWeight}`,
            })),
        };
    }
}
