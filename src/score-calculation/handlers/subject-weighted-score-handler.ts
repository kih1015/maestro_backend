import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface SubjectWeightedScoreConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[]; // 공통, 일반선택만 적용
    subjectWeights: Record<string, number>; // 교과별 가중치 (예: {'국어': 35, '수학': 15, ...})
    multiplier: number; // 최종 곱하기 값 (8 or 10)
    truncateDigits: number; // 중간 절사 자릿수 (6)
    finalTruncateDigits: number; // 최종 절사 자릿수 (4)
}

/**
 * 교과별 가중치 적용 점수 계산 핸들러
 * 공식: [(등급점수 × 이수단위) 합] × 가중치 / 교과별 이수단위 합 (소수점 N째자리 절사) × multiplier (소수점 M째자리 절사)
 */
export class SubjectWeightedScoreHandler extends BaseScoreHandler {
    protected readonly handlerType = 'SubjectWeightedScoreHandler';
    private readonly subject = '교과별 가중치 점수 계산';
    private readonly description = '교과별로 가중치를 적용하여 점수를 계산합니다.';

    constructor(private readonly config: SubjectWeightedScoreConfig[]) {
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

        // 교과별로 그룹화하여 계산
        const subjectGroups = new Map<string, { totalScore: number; totalUnit: number }>();

        for (const subject of student.subjectScores) {
            if (
                !subject.calculationDetail?.isReflected ||
                !config.subjectSeparations.includes(subject.subjectSeparationCode || '')
            ) {
                continue;
            }

            const subjectGroup = subject.subjectGroup || '';
            const weight = config.subjectWeights[subjectGroup];

            // 가중치가 없는 교과는 제외
            if (!weight) {
                continue;
            }

            const convertedScore = subject.calculationDetail?.convertedScore ?? 0;
            const unit = this.parseUnit(subject.unit);

            if (!subjectGroups.has(subjectGroup)) {
                subjectGroups.set(subjectGroup, { totalScore: 0, totalUnit: 0 });
            }

            const group = subjectGroups.get(subjectGroup)!;
            group.totalScore += convertedScore * unit;
            group.totalUnit += unit;
        }

        // 교과별 가중 평균 계산
        let totalWeightedScore = 0;

        for (const [subjectGroup, data] of subjectGroups.entries()) {
            const weight = config.subjectWeights[subjectGroup];

            if (data.totalUnit === 0) {
                continue;
            }

            // [(등급점수 × 이수단위) 합] × 가중치 / 교과별 이수단위 합
            const weightedAverage = (data.totalScore * weight) / data.totalUnit;

            // 중간 절사
            const truncatedAverage = this.truncate(weightedAverage, config.truncateDigits);

            totalWeightedScore += truncatedAverage;
        }

        // 최종 점수 = totalWeightedScore × multiplier
        const finalScore = totalWeightedScore * config.multiplier;

        // 최종 절사
        const truncatedFinalScore = this.truncate(finalScore, config.finalTruncateDigits);

        // context metadata에 저장 (다음 핸들러에서 사용)
        if (!context.metadata) {
            context.metadata = {};
        }
        context.metadata.commonGeneralScore = truncatedFinalScore;
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

    private findConfig(admission: string, unit: string): SubjectWeightedScoreConfig | undefined {
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
                formula: `\\sum\\left[\\frac{(등급점수 \\times 이수단위) \\times 가중치}{교과별\\ 이수단위} \\right] \\times ${c.multiplier}`,
            })),
        };
    }
}
