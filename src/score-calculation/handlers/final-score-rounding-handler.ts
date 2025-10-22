import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface FinalGradeToScoreConfig {
    admissions: string[];
    units: string[];
    digits: number;
}

export class FinalSoreRoundingHandler extends BaseScoreHandler {
    protected readonly handlerType = 'FinalSoreRoundingHandler';
    private readonly subject = '최종 점수 반올림';
    private readonly description = '최종점수를 반올림합니다.';

    constructor(private readonly config: FinalGradeToScoreConfig[]) {
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

        const multiple = Math.pow(10, config.digits);
        student.scoreResult.finalScore = Math.round(student.scoreResult.finalScore * multiple) / multiple;
    }

    private findConfig(admission: string, unit: string): FinalGradeToScoreConfig | undefined {
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
