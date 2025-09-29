import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface ValidationConfig {
    readonly supportedAdmissions: string[];
    readonly supportedUnits: string[];
}

export class GCNValidationHandler extends BaseScoreHandler {
    constructor(private readonly config: ValidationConfig) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        if (!this.isValidAdmission(type)) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '미지원 전형');
            context.shouldContinue = false;
            return;
        }
        if (!this.isValidUnit(unitCode)) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '미지원 모집단위');
            context.shouldContinue = false;
            return;
        }
    }

    private isValidAdmission(admission: string): boolean {
        return this.config.supportedAdmissions.includes(admission);
    }

    private isValidUnit(unit: string): boolean {
        return this.config.supportedUnits.includes(unit);
    }
}
