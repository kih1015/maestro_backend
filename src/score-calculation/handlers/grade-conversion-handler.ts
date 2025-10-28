import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface GradeConversionConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    reflectedSubjects?: string[];
    gradeMapping: { [grade: number | string]: number };
}

export class GradeConversionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'GradeConversionHandler';
    private readonly subject = '석차 등급 점수 환산';
    private readonly description = '석차 등급을 기준 점수로 환산합니다.';

    constructor(private readonly config: GradeConversionConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        for (const s of student.subjectScores) {
            if (s.calculationDetail) {
                continue;
            }

            const config = this.findConfig(type, unitCode, s.subjectSeparationCode, s.subjectGroup ?? '');
            if (!config) {
                continue;
            }

            let grade: number | string | null = s.rankingGrade ? Number(s.rankingGrade) : null;
            if (!grade) {
                grade = s.rankingGrade;
            }

            const convertedScore = config.gradeMapping[grade];
            if (convertedScore === undefined) {
                continue;
            }

            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                true,
                '',
                convertedScore,
                this.handlerType,
            );
        }
    }

    private findConfig(
        admission: string,
        unit: string,
        courseGroup: string,
        subjectGroup: string,
    ): GradeConversionConfig | undefined {
        return this.config.find(
            config =>
                config.admissions.includes(admission) &&
                config.units.includes(unit) &&
                config.subjectSeparations.includes(courseGroup) &&
                (config.reflectedSubjects ? config.reflectedSubjects.includes(subjectGroup) : true),
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
                mappingTable: Object.entries(c.gradeMapping).map(([key, value]) => ({
                    key: `${key}등급`,
                    value: `${value}점`,
                })),
            })),
        };
    }
}
