import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface FinalScoreFloorConfig {
    admissions: string[];
    units: string[];
    digits: number; // 소수점 몇째 자리에서 버림할지
}

export class FinalScoreFloorHandler extends BaseScoreHandler {
    protected readonly handlerType = 'FinalScoreFloorHandler';
    private readonly subject = '최종 점수 버림';
    private readonly description = '최종 점수를 지정된 소수점 자리에서 버림 처리합니다.';

    constructor(private readonly config: FinalScoreFloorConfig[]) {
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

        const finalScore = student.scoreResult.finalScore;
        const multiple = Math.pow(10, config.digits + 2);
        const rounded = Math.round(finalScore * multiple);
        student.scoreResult.finalScore = Math.floor(rounded / 100) / (multiple / 100);
    }

    private findConfig(admission: string, unit: string): FinalScoreFloorConfig | undefined {
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
                digits: c.digits,
                note: `소수점 ${c.digits}자리에서 버림`,
            })),
        };
    }
}
