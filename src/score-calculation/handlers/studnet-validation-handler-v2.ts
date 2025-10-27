import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface Filter {
    readonly admissions: string[];
    readonly units: string[];
}

export interface ValidationV2Config {
    readonly filters: Filter[];
}

export class StudentValidationHandlerV2 extends BaseScoreHandler {
    protected readonly handlerType = 'StudentValidationHandlerV2';
    private readonly subject = '전형-모집단위 필터';
    private readonly description = '유효 전형-모집단위만 필터링합니다.';

    constructor(private readonly config: ValidationV2Config) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const admissionCode = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        if (!this.isValidStudent(admissionCode, unitCode)) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '미지원 전형');
            context.shouldContinue = false;
            return;
        }
    }

    private isValidStudent(admission: string, unit: string): boolean {
        return this.config.filters.some(filter => {
            if (filter.admissions.includes(admission) && filter.units.includes(unit)) {
                return true;
            }
        });
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'filter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: [],
        };
    }
}
