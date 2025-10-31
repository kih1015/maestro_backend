import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface AverageGradeCalculationConfig {
    readonly admissions: string[];
    readonly units: string[];
}

/**
 * 평균 등급 계산 핸들러
 * 반영된 과목들의 환산 점수를 단순 평균으로 계산합니다 (가중평균이 아님)
 */
export class AverageGradeCalculationHandler extends BaseScoreHandler {
    protected readonly handlerType = 'AverageGradeCalculationHandler';
    private readonly subject = '평균 점수 계산';
    private readonly description = '반영된 과목들의 환산 점수를 단순 평균으로 계산합니다.';

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

        // 환산 점수의 단순 평균 계산
        const totalScore = reflectedSubjects.reduce((acc, s) => {
            return acc + (s.calculationDetail?.convertedScore ?? 0);
        }, 0);

        const averageScore = totalScore / reflectedSubjects.length;

        // averageScore를 finalScore에 저장
        student.scoreResult = StudentScoreResult.create(student.id, averageScore, 0, undefined);
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
                formula: `\\frac{\\sum(환산\\ 점수)}{과목\\ 수}`,
            })),
        };
    }
}
