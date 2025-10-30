import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface SeonggonghouiFinalScoreConfig {
    readonly admissions: string[];
    readonly units: string[];
    readonly baseScore: number; // 기본 점수 (300)
    readonly maxGrade: number; // 최대 등급 (9)
    readonly gradeDivisor: number; // 등급 나누기 값 (8)
    readonly multiplier: number; // 곱하기 값 (200)
}

/**
 * 성공회대 최종 점수 계산 핸들러
 * 공식: 300 + (9 - 평균등급) / 8 * 200
 */
export class SeonggonghouiFinalScoreHandler extends BaseScoreHandler {
    protected readonly handlerType = 'SeonggonghouiFinalScoreHandler';
    private readonly subject = '최종 점수 계산';
    private readonly description = '성공회대 학생부교과 최종 점수를 계산합니다.';

    constructor(private readonly config: SeonggonghouiFinalScoreConfig[]) {
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

        // 이전 핸들러에서 계산된 평균 등급 가져오기
        const averageGrade = student.scoreResult?.finalScore;
        if (!averageGrade) {
            return;
        }

        // 최종 점수 계산: 300 + (9 - 평균등급) / 8 * 200
        const finalScore =
            config.baseScore + ((config.maxGrade - averageGrade) / config.gradeDivisor) * config.multiplier;

        student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
    }

    private findConfig(admission: string, unit: string): SeonggonghouiFinalScoreConfig | undefined {
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
                formula: `${c.baseScore} + \\frac{(${c.maxGrade} - 평균등급)}{${c.gradeDivisor}} \\times ${c.multiplier}`,
            })),
        };
    }
}
