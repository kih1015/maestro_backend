import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { SoonguiConfig } from '../config/soongui.config';
import { StudentValidationHandler } from '../handlers/student-validation-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { BestSemesterSelectionHandler } from '../handlers/best-semester-selection-handler';
import { BestSemesterAverageFinalScoreHandler } from '../handlers/best-semester-average-final-score-handler';
import { ZScoreGradeConversionHandler } from '../handlers/zscore-grade-conversion-handler';
import { PercentileGradeConversionHandler } from '../handlers/percentile-grade-conversion-handler';

@Injectable()
export class SoonguiCalculator implements Calculator {
    private readonly type = CalculatorEnum.SOONGUI;
    private readonly config = new SoonguiConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const percentileGradeHandler = new PercentileGradeConversionHandler(this.config.percentileGradeConfig);
        const zScoreGradeConversionHandler = new ZScoreGradeConversionHandler(this.config.zScoreGradeConfig);
        const bestSemesterHandler = new BestSemesterSelectionHandler(this.config.bestSemesterSelectionConfig);
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const bestSemesterAverageFinalScoreHandler = new BestSemesterAverageFinalScoreHandler(
            this.config.bestSemesterAverageFinalScoreConfig,
        );

        // 핸들러 체이닝
        validationHandler
            .setNext(semesterHandler)
            .setNext(gradeConversionHandler)
            .setNext(percentileGradeHandler)
            .setNext(zScoreGradeConversionHandler)
            .setNext(bestSemesterHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(bestSemesterAverageFinalScoreHandler);

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
        return SoonguiConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return SoonguiConfig.UNIT_CODE_TO_NAME;
    }
}
