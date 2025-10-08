import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface ExcludedSubjectConfig {
    admissions: string[];
    units: string[];
    commonExcludedSubjects: string[];
}

export class ExcludedSubjectHandler extends BaseScoreHandler {
    protected readonly handlerType = 'ExcludedSubjectHandler';
    private readonly subject = '과목명 필터';
    private readonly description = '과목명을 기준으로 필터링합니다.';

    constructor(private readonly config: ExcludedSubjectConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unit = student.recruitmentUnitCode;

        const matchedConfig = this.findMatchingConfig(type, unit);
        if (!matchedConfig) {
            return;
        }

        for (const subject of student.subjectScores) {
            if (subject.calculationDetail && !subject.calculationDetail.isReflected) {
                continue;
            }
            if (matchedConfig.commonExcludedSubjects.includes(subject.subjectName)) {
                subject.calculationDetail = SubjectScoreCalculationDetail.create(
                    subject.id,
                    false,
                    '특정 공통 과목 미반영',
                    undefined,
                    this.handlerType,
                );
            }
        }
    }

    private findMatchingConfig(admission: string, unit: string): ExcludedSubjectConfig | undefined {
        return this.config.find(cfg => cfg.admissions.includes(admission) && cfg.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'filter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions.map(code => GacheonConfig.ADMISSION_CODE_TO_NAME[code]),
                units: c.units.map(code => GacheonConfig.UNIT_CODE_TO_NAME[code]),
                excludedGroup: c.commonExcludedSubjects,
            })),
        };
    }
}
