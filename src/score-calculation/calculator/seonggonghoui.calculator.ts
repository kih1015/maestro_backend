import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { SeonggonghouiConfig } from '../config/seonggonghoui.config';
import { StudentValidationHandler } from '../handlers/student-validation-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { SubjectGroupTopCourseSelectionHandler } from '../handlers/subject-group-top-course-selection-handler';
import { BaseScoreSumHandler } from '../handlers/base-score-sum-handler';
import { AverageGradeCalculationHandler } from '../handlers/average-grade-calculation-handler';
import { SeonggonghouiFinalScoreHandler } from '../handlers/seonggonghoui-final-score-handler';
import { FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';

@Injectable()
export class SeonggonghouiCalculator implements Calculator {
    private readonly type = CalculatorEnum.SEONGGONGHOUI;
    private readonly config = new SeonggonghouiConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupFilterHandler = new SubjectGroupFilterHandler(this.config.subjectGroupFilterConfig);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const subjectGroupTopCourseSelectionHandler = new SubjectGroupTopCourseSelectionHandler(
            this.config.subjectGroupTopCourseSelectionConfig,
        );
        const baseScoreSumHandler = new BaseScoreSumHandler(this.config.baseScoreSumConfig);
        const averageGradeCalculationHandler = new AverageGradeCalculationHandler(
            this.config.averageGradeCalculationConfig,
        );
        const seonggonghouiFinalScoreHandler = new SeonggonghouiFinalScoreHandler(this.config.finalScoreConfig);
        const finalScoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);

        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupFilterHandler)
            .setNext(gradeConversionHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(subjectGroupTopCourseSelectionHandler)
            .setNext(baseScoreSumHandler)
            .setNext(averageGradeCalculationHandler)
            .setNext(seonggonghouiFinalScoreHandler)
            .setNext(finalScoreRoundingHandler);

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
        return SeonggonghouiConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return SeonggonghouiConfig.UNIT_CODE_TO_NAME;
    }
}
