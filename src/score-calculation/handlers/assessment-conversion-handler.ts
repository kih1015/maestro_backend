import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface AssessmentConversionConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    assessmentMapping: Record<string, number>;
}

export class AssessmentConversionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'AssessmentConversionHandler';
    private readonly subject = '평어 점수 환산';
    private readonly description = '평어 점수를 기준 점수로 환산합니다.';

    constructor(private readonly config: AssessmentConversionConfig[]) {
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

            const config = this.findConfig(type, unitCode, s.subjectSeparationCode);
            if (!config) {
                continue;
            }

            const assessment = s.assessment ?? undefined;
            if (!assessment || !['수', '우', '미', '양', '가'].includes(assessment)) {
                continue;
            }

            const convertedScore = config.assessmentMapping[assessment];

            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                true,
                '',
                convertedScore,
                this.handlerType,
            );
        }
    }

    private findConfig(admission: string, unit: string, courseGroup: string): AssessmentConversionConfig | undefined {
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
                admissions: c.admissions.map(code => GacheonConfig.ADMISSION_CODE_TO_NAME[code]),
                units: c.units.map(code => GacheonConfig.UNIT_CODE_TO_NAME[code]),
                includedGroup: c.subjectSeparations.map(code => GacheonConfig.SUBJECT_SEPARATION_CODE_TO_NAME[code]),
            })),
        };
    }
}
