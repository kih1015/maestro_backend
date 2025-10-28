import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface CreditBonusConfig {
    admissions: string[];
    units: string[];
    bonusMultiplier: number; // 이수학점 합계에 곱할 배율 (예: 0.05)
}

export class CreditBonusHandler extends BaseScoreHandler {
    protected readonly handlerType = 'CreditBonusHandler';
    private readonly subject = '이수학점 가산점 계산';
    private readonly description =
        '반영교과 내 모든 이수과목의 이수학점 합계에 배율을 곱하여 가산점을 계산하고 최종 점수에 추가합니다.';

    constructor(private readonly config: CreditBonusConfig[]) {
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

        // 반영된 과목들의 이수학점 합계 계산
        const reflectedSubjects = student.subjectScores.filter(s => s.calculationDetail?.isReflected);
        const totalCredits = reflectedSubjects.reduce((sum, subject) => {
            const credit = this.parseUnit(subject.unit);
            return sum + credit;
        }, 0);

        // 가산점 = 이수학점 합계 × 배율
        const bonusPoint = totalCredits * config.bonusMultiplier;

        // 최종 점수에 가산점 추가
        student.scoreResult.finalScore += bonusPoint;
    }

    private findConfig(admission: string, unit: string): CreditBonusConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    private parseUnit(unit?: string | null): number {
        const parsedUnit = parseFloat(unit ?? '');
        return Number.isFinite(parsedUnit) && parsedUnit > 0 ? parsedUnit : 0;
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
                bonusMultiplier: c.bonusMultiplier,
                formula: `가산점 = \\sum(반영교과 이수학점) \\times ${c.bonusMultiplier}`,
            })),
        };
    }
}
