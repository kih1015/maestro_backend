import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { YonseiConfig } from '../config/yonsei.config';
import { StudentValidationHandler } from '../handlers/student-validation-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { YonseiScoreCalculationHandler } from '../handlers/yonsei-score-calculation-handler';

@Injectable()
export class YonseiCalculator implements Calculator {
    private readonly type = CalculatorEnum.YONSEI;
    private readonly config = new YonseiConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const yonseiScoreHandler = new YonseiScoreCalculationHandler(this.config);

        // 핸들러 체이닝
        validationHandler.setNext(semesterHandler).setNext(yonseiScoreHandler);

        this.handler = validationHandler;
    }

    support(calculatorType: CalculatorEnum): boolean {
        return calculatorType === this.type;
    }

    calculate(student: Student): void {
        const context: ScoreCalculationContext = {
            student: student,
            shouldContinue: true,
        };

        this.handler.handle(context);
    }

    getCalculatorInfo(): HandlerInfo[] {
        return this.handler.listInfo();
    }

    getAdmissionMapper(): Record<string, string> {
        return YonseiConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return YonseiConfig.UNIT_CODE_TO_NAME;
    }
}
