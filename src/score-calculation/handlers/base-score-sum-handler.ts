import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface BaseScoreSumConfig {
    readonly admissions: string[];
    readonly units: string[];
    readonly baseScore: number; // 기본 점수 (404)
}

/**
 * 기본 점수 + 점수 합산 핸들러
 * 공식: 기본점수 + 반영된 과목들의 변환 점수 합계
 */
export class BaseScoreSumHandler extends BaseScoreHandler {
    protected readonly handlerType = 'BaseScoreSumHandler';
    private readonly subject = '기본 점수 + 점수 합산';
    private readonly description = '기본 점수에 반영된 과목들의 변환 점수를 합산합니다.';

    constructor(private readonly config: BaseScoreSumConfig[]) {
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
            student.scoreResult = StudentScoreResult.create(student.id, config.baseScore, 0, '반영 과목 없음');
            return;
        }

        // 반영된 과목들의 변환 점수 합계
        const totalScore = reflectedSubjects.reduce((acc, s) => {
            return acc + (s.calculationDetail?.convertedScore ?? 0);
        }, 0);

        // 최종 점수 = 기본 점수 + 점수 합계
        const finalScore = config.baseScore + totalScore;

        student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
    }

    private findConfig(admission: string, unit: string): BaseScoreSumConfig | undefined {
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
                formula: `${c.baseScore} + \\sum(변환 점수)`,
            })),
        };
    }
}
