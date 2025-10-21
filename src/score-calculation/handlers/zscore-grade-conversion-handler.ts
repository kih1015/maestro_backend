import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface ZScoreGradeConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
}

export class ZScoreGradeConversionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'ZScoreGradeConversionHandler';
    private readonly subject = 'Z값 등급 환산';
    private readonly description = '석차등급이 없는 경우 원점수, 평균, 표준편차를 활용하여 Z값으로 등급을 산출합니다.';

    constructor(private readonly config: ZScoreGradeConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) {
                continue;
            }

            if (!['A', 'B', 'C', 'D', 'E'].includes(s.rankingGrade)) {
                continue;
            }

            const config = this.findConfig(type, unitCode, s.subjectSeparationCode);
            if (!config) {
                continue;
            }

            const originalScore = s.originalScore;
            const avgScore = s.avgScore ? parseFloat(s.avgScore) : null;
            const stdDev = s.standardDeviation ? parseFloat(s.standardDeviation) : null;

            if (
                originalScore === null ||
                originalScore === undefined ||
                avgScore === null ||
                stdDev === null ||
                stdDev === 0
            ) {
                continue;
            }

            const zScore = (originalScore - avgScore) / stdDev;
            const grade = this.zScoreToGrade(zScore);

            const formula = `Z = (${originalScore} - ${avgScore}) / ${stdDev} = ${zScore.toFixed(2)} → ${grade}등급`;

            if (student.identifyNumber === '12181721') {
                console.log(s.subjectName);
                console.log(zScore);
            }

            s.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: s.id,
                isReflected: true,
                nonReflectionReason: '',
                convertedScore: grade,
                convertedBaseValue: 'Z_SCORE',
                conversionFormula: formula,
                calculationHandler: this.handlerType,
            });
        }
    }

    /**
     * Z값을 등급으로 변환
     * 표준정규분포 기준:
     * 1등급: 상위 4% (z ≥ 1.76)
     * 2등급: 상위 11% (1.23 ≤ z < 1.76)
     * 3등급: 상위 23% (0.74 ≤ z < 1.23)
     * 4등급: 상위 40% (0.26 ≤ z < 0.74)
     * 5등급: 상위 60% (-0.25 ≤ z < 0.26)
     * 6등급: 상위 77% (-0.73 ≤ z < -0.25)
     * 7등급: 상위 89% (-1.22 ≤ z < -0.73)
     * 8등급: 상위 96% (-1.75 ≤ z < -1.22)
     * 9등급: 하위 4% (z < -1.75)
     */
    private zScoreToGrade(zScore: number): number {
        if (zScore >= 1.76) return 1;
        if (zScore >= 1.226) return 2;
        if (zScore >= 0.738) return 3;
        if (zScore >= 0.26) return 4;
        if (zScore >= -0.25) return 5;
        if (zScore >= -0.73) return 6;
        if (zScore >= -1.22) return 7;
        if (zScore >= -1.75) return 8;
        return 9;
    }

    private findConfig(admission: string, unit: string, courseGroup: string): ZScoreGradeConfig | undefined {
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
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
                includedGroup: c.subjectSeparations,
                note: 'Z값 = (원점수 - 평균) / 표준편차, 표준정규분포 기준 등급 환산',
            })),
        };
    }
}
