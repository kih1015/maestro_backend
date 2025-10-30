import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface CareerSubjectScoreConfig {
    admissions: string[];
    units: string[];
    careerSubjectSeparationCode: string; // 진로선택 과목 코드 (02)
    maxRatioByCount: Array<{ minCount: number; maxRatio: number }>; // 과목 수별 최대 취득 비율
    baseMaxRatio: number; // 기준 최대 비율 (20%)
    multiplier: number; // 곱하기 값 (2)
    truncateDigits: number; // 중간 절사 자릿수 (5)
    finalTruncateDigits: number; // 최종 절사 자릿수 (3)
}

/**
 * 진로선택 과목 점수 계산 핸들러
 * - 이수 과목 수에 따라 최대 취득 비율 제한
 * - 공식: [(등급점수 × 이수단위) 합] / 반영교과 이수단위 합 (소수점 절사) × 2 × (최대취득비율 / 20%)
 *
 * 전제조건:
 * - AchievementToGradeConversionHandler에서 성취도(A/B/C)를 등급(1/2/3)으로 변환 완료
 * - GradeConversionHandler에서 등급을 점수로 변환 완료
 */
export class CareerSubjectScoreHandler extends BaseScoreHandler {
    protected readonly handlerType = 'CareerSubjectScoreHandler';
    private readonly subject = '진로선택 과목 점수 계산';
    private readonly description = '진로선택 과목의 가중평균 점수를 계산합니다.';

    constructor(private readonly config: CareerSubjectScoreConfig[]) {
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

        // 진로선택 과목 필터링 (이미 점수가 변환된 과목만)
        const careerSubjects = student.subjectScores.filter(
            s => s.calculationDetail?.isReflected && s.subjectSeparationCode === config.careerSubjectSeparationCode,
        );

        if (careerSubjects.length === 0) {
            // 진로선택 과목이 없으면 0점
            if (!context.metadata) {
                context.metadata = {};
            }
            context.metadata.careerScore = 0;
            return;
        }

        // 이수 과목 수에 따른 최대 취득 비율 결정
        const careerCount = careerSubjects.length;
        const maxRatio = this.getMaxRatio(careerCount, config);

        // [(등급점수 × 이수단위) 합] / 반영교과 이수단위 합
        let totalWeightedScore = 0;
        let totalUnit = 0;

        for (const subject of careerSubjects) {
            const convertedScore = subject.calculationDetail?.convertedScore ?? 0;
            const unit = this.parseUnit(subject.unit);

            totalWeightedScore += convertedScore * unit;
            totalUnit += unit;
        }

        if (totalUnit === 0) {
            if (!context.metadata) {
                context.metadata = {};
            }
            context.metadata.careerScore = 0;
            return;
        }

        const average = totalWeightedScore / totalUnit;
        const truncatedAverage = this.truncate(average, config.truncateDigits);

        // 최종 점수 = average × multiplier × (maxRatio / baseMaxRatio)
        const finalScore = truncatedAverage * config.multiplier * (maxRatio / config.baseMaxRatio);
        const truncatedFinalScore = this.truncate(finalScore, config.finalTruncateDigits);

        // context metadata에 저장
        if (!context.metadata) {
            context.metadata = {};
        }
        context.metadata.careerScore = truncatedFinalScore;
    }

    private getMaxRatio(count: number, config: CareerSubjectScoreConfig): number {
        // maxRatioByCount를 내림차순으로 정렬하여 조건에 맞는 첫 번째 항목 찾기
        const sorted = [...config.maxRatioByCount].sort((a, b) => b.minCount - a.minCount);

        for (const rule of sorted) {
            if (count >= rule.minCount) {
                return rule.maxRatio;
            }
        }

        return 0;
    }

    private parseUnit(unit?: string | null): number {
        const parsedUnit = parseFloat(unit ?? '');
        return Number.isFinite(parsedUnit) && parsedUnit > 0 ? parsedUnit : 1;
    }

    private truncate(value: number, digits: number): number {
        const highPrecision = Math.pow(10, Math.max(0, digits + 2));
        const roundedInt = Math.round(value * highPrecision);
        const divisor = Math.pow(10, 2); // (digits+2) → digits로 내리기 위한 10^2
        const floored = Math.floor(roundedInt / divisor);
        return floored / Math.pow(10, digits);
    }

    private findConfig(admission: string, unit: string): CareerSubjectScoreConfig | undefined {
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
                formula: `\\frac{(등급점수 \\times 이수단위)}{반영교과\\ 이수단위} \\times ${c.multiplier} \\times \\frac{최대취득비율}{${c.baseMaxRatio}}`,
            })),
        };
    }
}
