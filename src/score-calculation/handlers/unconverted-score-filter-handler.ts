import { SubjectScoreCalculationDetail } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { GacheonConfig } from '../config/gacheon.config';

export interface UnconvertedScoreFilterConfig {
    admissions: string[];
    units: string[];
}

export class UnconvertedScoreFilterHandler extends BaseScoreHandler {
    protected readonly handlerType = 'UnconvertedScoreFilterHandler';
    private readonly subject = '미환산 과목 필터 핸들러';
    private readonly description = '환산되지 않은 과목을 미반영 처리합니다.';

    constructor(private readonly config: UnconvertedScoreFilterConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;

        if (!this.findConfig(student.recruitmentTypeCode, student.recruitmentUnitCode)) {
            return;
        }

        for (const subject of student.subjectScores) {
            if (!subject.calculationDetail) {
                subject.calculationDetail = SubjectScoreCalculationDetail.create(
                    subject.id,
                    false,
                    '등급 누락/범위 오류',
                    0,
                    this.handlerType,
                );
            }
        }
    }

    private findConfig(admission: string, unit: string): UnconvertedScoreFilterConfig | undefined {
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
                units: c.units.map(code => GacheonConfig.UNIT_CODE_TO_NAME[code]),
            })),
        };
    }
}
