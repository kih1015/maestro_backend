import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { TukoreaConfig } from '../config/tukorea.config';
import { StudentValidationHandler } from '../handlers/student-validation-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { TukoreaScoreCalculationHandler } from '../handlers/tukorea-score-calculation-handler';

@Injectable()
export class TukoreaCalculator implements Calculator {
    private readonly type = CalculatorEnum.TUKOREA;
    private readonly config = new TukoreaConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const tukoreaScoreHandler = new TukoreaScoreCalculationHandler(this.config);

        // 핸들러 체이닝
        validationHandler.setNext(semesterHandler).setNext(tukoreaScoreHandler);

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
        return TukoreaConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return TukoreaConfig.UNIT_CODE_TO_NAME;
    }
}
