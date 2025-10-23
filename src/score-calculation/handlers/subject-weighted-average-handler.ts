import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface SubjectWeightedAverageConfig {
    readonly admissions: string[];
    readonly units: string[];
    readonly subjectWeights: Record<string, number>; // 과목명: 가중치
}

export class SubjectWeightedAverageHandler extends BaseScoreHandler {
    protected readonly handlerType = 'SubjectWeightedAverageHandler';
    private readonly subject = '과목별 가중 이수평균 계산';
    private readonly description = '각 과목별로 지정된 가중치를 적용하여 이수가중평균을 계산합니다.';

    constructor(private readonly config: SubjectWeightedAverageConfig[]) {
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

        // 각 과목별로 이수가중평균 계산
        const subjectAverages: Record<string, number> = {};

        for (const subjectName of Object.keys(config.subjectWeights)) {
            const subjectScores = student.subjectScores.filter(
                s => s.calculationDetail?.isReflected && s.subjectGroup === subjectName,
            );

            if (subjectScores.length > 0) {
                subjectAverages[subjectName] = this.calculateWeightedAverage(
                    subjectScores.map(s => ({
                        score: s.calculationDetail?.convertedScore ?? 0,
                        unit: this.parseUnit(s.unit),
                    })),
                );
            }
        }

        // 각 과목 평균에 가중치를 적용하여 최종 점수 계산
        let finalScore = 0;
        for (const [subjectName, weight] of Object.entries(config.subjectWeights)) {
            const average = subjectAverages[subjectName] ?? 0;
            finalScore += average * weight;
        }

        student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
    }

    private findConfig(admission: string, unit: string): SubjectWeightedAverageConfig | undefined {
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
            config: this.config.map(c => {
                const subjectWeightList = Object.entries(c.subjectWeights).map(([subject, weight]) => ({
                    key: subject,
                    value: `${weight * 100}%`,
                }));

                const formula = Object.entries(c.subjectWeights)
                    .map(
                        ([subject, weight]) =>
                            `\\frac{\\sum(${subject} 변환점수 \\times 단위수)}{\\sum(${subject} 단위수)} \\times ${weight}`,
                    )
                    .join(' + ');

                return {
                    admissions: c.admissions,
                    units: c.units,
                    mappingTable: subjectWeightList,
                    formula: formula,
                };
            }),
        };
    }
}
