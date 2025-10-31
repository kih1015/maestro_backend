import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface SungsilFinalScoreConfig {
    readonly admissions: string[];
    readonly units: string[];
}

/**
 * 숭실대 최종 점수 합산 핸들러
 * 공통/일반선택 점수 + 진로선택 점수
 */
export class SungsilFinalScoreHandler extends BaseScoreHandler {
    protected readonly handlerType = 'SungsilFinalScoreHandler';
    private readonly subject = '최종 점수 합산';
    private readonly description = '공통/일반선택 점수와 진로선택 점수를 합산합니다.';

    constructor(private readonly config: SungsilFinalScoreConfig[]) {
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

        const commonGeneralScore = (context.metadata?.commonGeneralScore ?? 0) as number;
        const careerScore = (context.metadata?.careerScore ?? 0) as number;

        const finalScore = commonGeneralScore + careerScore;

        student.scoreResult = StudentScoreResult.create(
            student.id,
            finalScore,
            0,
            `${commonGeneralScore} + ${careerScore} = ${finalScore}`,
        );
    }

    private findConfig(admission: string, unit: string): SungsilFinalScoreConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'calc',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
                formula: '공통/일반선택점수 + 진로선택점수',
            })),
        };
    }
}
