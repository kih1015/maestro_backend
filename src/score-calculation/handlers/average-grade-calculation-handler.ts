import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface AverageGradeCalculationConfig {
    readonly admissions: string[];
    readonly units: string[];
}

/**
 * 평균 등급 계산 핸들러
 * 반영된 과목들의 등급을 단순 평균으로 계산합니다 (가중평균이 아님)
 */
export class AverageGradeCalculationHandler extends BaseScoreHandler {
    protected readonly handlerType = 'AverageGradeCalculationHandler';
    private readonly subject = '평균 등급 계산';
    private readonly description = '반영된 과목들의 등급을 단순 평균으로 계산합니다.';

    constructor(private readonly config: AverageGradeCalculationConfig[]) {
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

        if (reflectedSubjects.length === 0) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '반영 과목 없음');
            context.shouldContinue = false;
            return;
        }

        // 등급의 단순 평균 계산
        const totalGrade = reflectedSubjects.reduce((acc, s) => {
            const grade = parseFloat(s.rankingGrade);
            return acc + (Number.isFinite(grade) ? grade : 9);
        }, 0);

        const averageGrade = totalGrade / reflectedSubjects.length;

        // averageGrade를 임시로 finalScore에 저장 (다음 핸들러에서 최종 점수로 변환)
        student.scoreResult = StudentScoreResult.create(student.id, averageGrade, 0, undefined);
    }

    private findConfig(admission: string, unit: string): AverageGradeCalculationConfig | undefined {
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
                formula: `\\frac{\\sum(등급)}{과목 수}`,
            })),
        };
    }
}
