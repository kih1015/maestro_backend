import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface PercentileGradeConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    graduateYearThreshold: number; // 예: 2008 (2008년 이전 졸업자에게만 적용)
    gradeScoreMapping: Record<number, number>; // 등급별 점수 매핑 (1등급 -> 100점 등)
    isNotReflectedForSameRank?: boolean;
}

export class PercentileGradeConversionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'PercentileGradeConversionHandler';
    private readonly subject = '석차 백분율 등급 환산';
    private readonly description = '2008년 이전 졸업자에 대해 석차 백분율을 계산하여 등급을 산출합니다.';

    constructor(private readonly config: PercentileGradeConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;
        const graduateYear = parseInt(student.graduateYear);

        for (const s of student.subjectScores) {
            if (s.calculationDetail) {
                continue;
            }

            if (s.rankingGrade && s.rankingGrade.trim() !== '') {
                continue;
            }

            const config = this.findConfig(type, unitCode, s.subjectSeparationCode);
            if (!config) {
                continue;
            }

            if (isNaN(graduateYear) || graduateYear >= config.graduateYearThreshold) {
                continue;
            }

            const rank = s.rank ? parseInt(s.rank) : null;
            const sameRank = s.sameRank ? parseInt(s.sameRank) : 1;
            const studentCount = s.studentCount ? parseInt(s.studentCount) : null;

            if (rank === null || studentCount === null || studentCount === 0) {
                continue;
            }

            const adjustedRank = rank + (sameRank - 1) / 2;
            let percentile = (adjustedRank / studentCount) * 100;
            if (config.isNotReflectedForSameRank) {
                percentile = (rank / studentCount) * 100;
            }
            const grade = this.percentileToGrade(percentile);
            const convertedScore = config.gradeScoreMapping[grade] ?? 0;
            const formula = `백분율 = [${rank}+(${sameRank}-1)/2] / ${studentCount} * 100 = ${percentile.toFixed(2)}% → ${grade}등급 → ${convertedScore}점`;

            s.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: s.id,
                isReflected: true,
                nonReflectionReason: '',
                convertedScore: convertedScore,
                convertedBaseValue: 'PERCENTILE',
                conversionFormula: formula,
                calculationHandler: this.handlerType,
            });
        }
    }

    /**
     * 백분율을 등급으로 변환
     * 1등급: 상위 4% (0 ≤ p < 4)
     * 2등급: 상위 11% (4 ≤ p < 11)
     * 3등급: 상위 23% (11 ≤ p < 23)
     * 4등급: 상위 40% (23 ≤ p < 40)
     * 5등급: 상위 60% (40 ≤ p < 60)
     * 6등급: 상위 77% (60 ≤ p < 77)
     * 7등급: 상위 89% (77 ≤ p < 89)
     * 8등급: 상위 96% (89 ≤ p < 96)
     * 9등급: 하위 4% (96 ≤ p ≤ 100)
     */
    private percentileToGrade(percentile: number): number {
        if (percentile < 4) return 1;
        if (percentile < 11) return 2;
        if (percentile < 23) return 3;
        if (percentile < 40) return 4;
        if (percentile < 60) return 5;
        if (percentile < 77) return 6;
        if (percentile < 89) return 7;
        if (percentile < 96) return 8;
        return 9;
    }

    private findConfig(admission: string, unit: string, courseGroup: string): PercentileGradeConfig | undefined {
        return this.config.find(
            config =>
                config.admissions.includes(admission) &&
                config.units.includes(unit) &&
                config.subjectSeparations.includes(courseGroup),
        );
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'converter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => {
                const mappingStr = Object.entries(c.gradeScoreMapping)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([grade, score]) => `${grade}등급→${score}점`)
                    .join(', ');
                return {
                    admissions: c.admissions,
                    units: c.units,
                    includedGroup: c.subjectSeparations,
                    note: `${c.graduateYearThreshold}년 이전 졸업자에게만 적용, 백분율 = [석차+(동석차-1)/2] / 재적수 * 100, 등급점수: ${mappingStr}`,
                };
            }),
        };
    }
}
