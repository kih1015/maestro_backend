import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface WeightApplyConfig {
    admissions: string[];
    units: string[];
    weight: number;
}

export class WeightApplyHandler extends BaseScoreHandler {
    protected readonly handlerType = 'WeightApplyHandler';
    private readonly subject = '최종 점수 반영 비율 적용';
    private readonly description = '최종 점수 반영 비율을 적용합니다.';

    constructor(private readonly config: WeightApplyConfig[]) {
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

        if (!student.scoreResult) {
            return;
        }

        student.scoreResult.finalScore *= config.weight;
    }

    private findConfig(admission: string, unit: string): WeightApplyConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'converter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
            })),
        };
    }
}
