import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface FinalGradeToScoreConfig {
    admissions: string[];
    units: string[];
}

export class FinalGradeToScoreHandler extends BaseScoreHandler {
    protected readonly handlerType = 'FinalGradeToScoreHandler';
    private readonly subject = '최종 등급 점수 환산';
    private readonly description =
        '등급을 100점 만점 점수로 환산합니다 (1등급=100점, 9등급=0점, 소수점 첫째 자리 이후 절사)';

    constructor(private readonly config: FinalGradeToScoreConfig[]) {
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

        if (!student.scoreResult) {
            return;
        }

        const averageGrade = student.scoreResult.finalScore;

        if (!this.isValidGrade(averageGrade)) {
            student.scoreResult.finalScore = 0;
            return;
        }

        student.scoreResult.finalScore = 100 - (Math.floor(averageGrade * 10) / 10 - 1) * 12.5;
    }

    private isValidGrade(g: number | null): g is number {
        return typeof g === 'number' && !isNaN(g) && g >= 1 && g <= 9;
    }

    private findConfig(admission: string, unit: string): FinalGradeToScoreConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        const gradeMapping: { key: string; value: string }[] = [];
        for (let grade = 1; grade <= 9; grade++) {
            const rawScore = 100 - (grade - 1) * 12.5;
            const score = Math.floor(rawScore);
            gradeMapping.push({ key: `${grade}등급`, value: `${score}점` });
        }

        return {
            type: 'converter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
                mappingTable: gradeMapping,
            })),
        };
    }
}
