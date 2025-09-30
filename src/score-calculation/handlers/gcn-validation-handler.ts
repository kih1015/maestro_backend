import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface ValidationConfig {
    readonly admissions: string[];
    readonly units: string[];
}

export class GCNValidationHandler extends BaseScoreHandler {
    private readonly subject = '전형-모집단위 필터';
    private readonly description = '유효 전형-모집단위만 필터링합니다.';

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
        return this.config.admissions.includes(admission);
    }

    private isValidUnit(unit: string): boolean {
        return this.config.units.includes(unit);
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'filter',
            subject: this.subject,
            description: this.description,
            config: [
                {
                    admissions: this.config.admissions.map(code => GacheonConfig.ADMISSION_CODE_TO_NAME[code]),
                    units: this.config.units.map(code => GacheonConfig.UNIT_CODE_TO_NAME[code]),
                },
            ],
        };
    }
}
