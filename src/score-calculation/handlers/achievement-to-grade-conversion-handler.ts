import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface AchievementToGradeConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    achievementMapping: { [achievement: string]: number };
}

export class AchievementToGradeConversionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'AchievementToGradeConversionHandler';
    private readonly subject = '성취도 등급 환산';
    private readonly description = '진로선택과목의 성취도(A/B/C)를 등급으로 환산합니다.';

    constructor(private readonly config: AchievementToGradeConfig[]) {
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

            const achievement = s.achievement?.trim().toUpperCase();
            if (!achievement) {
                continue;
            }

            const convertedGrade = config.achievementMapping[achievement];
            if (convertedGrade === undefined) {
                continue;
            }

            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                true,
                '',
                convertedGrade,
                this.handlerType,
            );
        }
    }

    private findConfig(admission: string, unit: string, courseGroup: string): AchievementToGradeConfig | undefined {
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
                admissions: c.admissions,
                units: c.units,
                includedGroup: c.subjectSeparations,
                mappingTable: Object.entries(c.achievementMapping).map(([key, value]) => ({
                    key: `성취도 ${key}`,
                    value: `${value}등급`,
                })),
            })),
        };
    }
}
