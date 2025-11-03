import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface AverageGradeCalculationConfig {
    readonly admissions: string[];
    readonly units: string[];
    readonly minCourseCount?: number; // 최소 과목 수 (선택)
    readonly defaultScore?: number; // 최소 과목 수 미달 시 사용할 기본 점수 (선택)
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
        let totalScore = reflectedSubjects.reduce((acc, s) => {
            return acc + (s.calculationDetail?.convertedScore ?? 0);
        }, 0);

        let courseCount = reflectedSubjects.length;

        // 최소 과목 수 미달 시 기본 점수로 채우기
        if (config.minCourseCount && config.defaultScore !== undefined) {
            if (courseCount < config.minCourseCount) {
                const missingCount = config.minCourseCount - courseCount;
                totalScore += config.defaultScore * missingCount;
                courseCount = config.minCourseCount;
            }
        }

        const averageScore = totalScore / courseCount;

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
                minCourseCount: c.minCourseCount,
                defaultScore: c.defaultScore,
                note:
                    c.minCourseCount && c.defaultScore !== undefined
                        ? `최소 ${c.minCourseCount}개 과목 미달 시 부족한 과목 수만큼 ${c.defaultScore}점(9등급) 추가`
                        : undefined,
            })),
        };
    }
}
