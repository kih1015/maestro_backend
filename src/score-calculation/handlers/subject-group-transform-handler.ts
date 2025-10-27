import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface SubjectGroupTransformConfig {
    admissions: string[];
    units: string[];
    subjectGroupTransformMapping: Record<string, string>;
}

export class SubjectGroupTransformHandler extends BaseScoreHandler {
    protected readonly handlerType = 'SubjectGroupTransformHandler';
    private readonly subject = '교과 그룹 변경';
    private readonly description = '교과 그룹을 변경합니다.';

    constructor(private readonly config: SubjectGroupTransformConfig[]) {
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

        student.subjectScores.forEach(score => {
            const convertedSubjectGroup = config.subjectGroupTransformMapping[score.subjectGroup ?? ''];
            if (!convertedSubjectGroup) {
                return;
            }
            score.subjectGroup = convertedSubjectGroup;
        });
    }

    private findConfig(admission: string, unit: string): SubjectGroupTransformConfig | undefined {
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
                units: c.units,
            })),
        };
    }
}
