import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface MinimumUnitRequirementConfig {
    admissions: string[];
    units: string[];
    minimumUnit: number;
}

export class MinimumUnitRequirementHandler extends BaseScoreHandler {
    protected readonly handlerType = 'MinimumUnitRequirementHandler';
    private readonly subject = '최소 이수단위 검증 핸들러';
    private readonly description = '반영과목 이수단위 합이 최소 요구 단위 미만일 경우 0점 처리합니다.';

    constructor(private readonly config: MinimumUnitRequirementConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;

        const applicableConfig = this.findConfig(student.recruitmentTypeCode, student.recruitmentUnitCode);
        if (!applicableConfig) {
            return;
        }

        // 반영되는 과목들의 이수단위 합 계산
        const totalUnit = student.subjectScores
            .filter(subject => subject.calculationDetail?.isReflected === true)
            .reduce((sum, subject) => {
                const unit = parseFloat(subject.unit);
                return sum + (isNaN(unit) ? 0 : unit);
            }, 0);

        // 최소 이수단위 미만인 경우
        if (totalUnit < applicableConfig.minimumUnit) {
            // 모든 과목을 미반영 처리
            for (const subject of student.subjectScores) {
                if (subject.calculationDetail) {
                    subject.calculationDetail.isReflected = false;
                    subject.calculationDetail.nonReflectionReason = `이수단위 부족 (${totalUnit}/${applicableConfig.minimumUnit})`;
                }
            }

            // 학생 점수 결과를 0점으로 설정
            student.scoreResult = StudentScoreResult.create(
                student.id,
                0,
                0,
                `이수단위 부족으로 0점 처리 (${totalUnit}/${applicableConfig.minimumUnit})`,
            );

            // 후속 핸들러 실행 중단
            context.shouldContinue = false;
        }
    }

    private findConfig(admission: string, unit: string): MinimumUnitRequirementConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'filter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
                formula: `이수단위 합 >= ${c.minimumUnit}`,
            })),
        };
    }
}
