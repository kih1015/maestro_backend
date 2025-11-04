import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface HanshinWeightedAverageConfig {
    readonly admissions: string[];
    readonly units: string[];
    readonly minCourseCount: number; // 최소 과목 수
    readonly defaultScore: number; // 최소 과목 수 미달 시 사용할 기본 점수
    readonly multiplier: number; // 최종 점수에 곱할 값 (10)
    readonly intermediateRoundDigits: number; // 중간 계산 반올림 자릿수 (3: 소수점 셋째자리까지)
    readonly finalRoundDigits: number; // 최종 반올림 자릿수 (2: 소수점 둘째자리까지)
}

/**
 * 한신대 가중평균 계산 핸들러
 *
 * 계산 순서:
 * 1. 가중평균 = Σ(이수단위 × 환산점수) / Σ(이수단위)
 * 2. 10과목 미달 시 부족한 과목만큼 기본점수 추가
 * 3. 가중평균을 소수점 셋째자리까지 올림
 * 4. 최종점수 = 가중평균 × 10
 * 5. 최종점수를 소수점 둘째자리까지 올림
 */
export class HanshinWeightedAverageHandler extends BaseScoreHandler {
    protected readonly handlerType = 'HanshinWeightedAverageHandler';
    private readonly subject = '한신대 가중평균 계산';
    private readonly description = '이수단위를 반영한 가중평균을 계산하고 최종 점수를 산출합니다.';

    constructor(private readonly config: HanshinWeightedAverageConfig[]) {
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

        const reflectedSubjects = student.subjectScores.filter(s => s.calculationDetail?.isReflected);

        if (reflectedSubjects.length < config.minCourseCount) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '반영 과목 미달');
            context.shouldContinue = false;
            return;
        }

        // 가중평균 계산: Σ(이수단위 × 환산점수) / Σ(이수단위)
        let totalWeightedScore = 0;
        let totalUnit = 0;

        for (const subject of reflectedSubjects) {
            const score = subject.calculationDetail?.convertedScore ?? 0;
            const unit = this.parseUnit(subject.unit);
            totalWeightedScore += score * unit;
            totalUnit += unit;
        }

        let weightedAverage = totalUnit > 0 ? totalWeightedScore / totalUnit : 0;

        // 소수점 셋째자리까지 올림 (올림 = 반올림을 위해 작은 값 더하기)
        weightedAverage = this.roundToDigits(weightedAverage, config.intermediateRoundDigits);

        // 최종 점수 = 가중평균 × 10
        let finalScore = weightedAverage * config.multiplier;

        // 소수점 둘째자리까지 올림
        finalScore = this.roundToDigits(finalScore, config.finalRoundDigits);

        student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
    }

    private parseUnit(unit?: string | null): number {
        const parsedUnit = parseFloat(unit ?? '');
        return Number.isFinite(parsedUnit) && parsedUnit > 0 ? parsedUnit : 1;
    }

    /**
     * 지정된 자릿수까지 올림
     * @param value 값
     * @param digits 소수점 자릿수
     */
    private roundToDigits(value: number, digits: number): number {
        const multiplier = Math.pow(10, digits);
        return Math.floor(Number(value.toPrecision(15)) * multiplier + 0.5) / multiplier;
    }

    private findConfig(admission: string, unit: string): HanshinWeightedAverageConfig | undefined {
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
                formula: `\\frac{\\sum(이수단위 \\times 환산점수)}{\\sum(이수단위)} \\times ${c.multiplier}`,
                minCourseCount: c.minCourseCount,
                defaultScore: c.defaultScore,
                note: `${c.minCourseCount}과목 미달 시 부족한 과목만큼 ${c.defaultScore}점 추가. 가중평균은 소수점 ${c.intermediateRoundDigits + 1}자리에서 올림, 최종점수는 소수점 ${c.finalRoundDigits + 1}자리에서 올림`,
            })),
        };
    }
}
