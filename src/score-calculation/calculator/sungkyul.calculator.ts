import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { SungkyulConfig } from '../config/sungkyul.config';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { TopCourseSelectionHandler } from '../handlers/top-course-selection-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { PercentileGradeConversionHandler } from '../handlers/percentile-grade-conversion-handler';
import { AverageScoreTo1000Handler } from '../handlers/average-score-to-1000-handler';
import { FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';
import { DefaultScoreFillerHandler } from '../handlers/default-score-filler-handler';

@Injectable()
export class SungkyulCalculator implements Calculator {
    private readonly type = CalculatorEnum.SUNGKYUL;
    private readonly config = new SungkyulConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupFilterHandler = new SubjectGroupFilterHandler(this.config.subjectGroupFilterConfig);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const percentileGradeHandler = new PercentileGradeConversionHandler(this.config.percentileGradeConfig);
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const topCourseSelectionHandler = new TopCourseSelectionHandler(this.config.topCourseSelectionConfig);
        const defaultScoreFillerHandler = new DefaultScoreFillerHandler(this.config.defaultScoreFillerConfig);
        const finalScoreCalculationHandler = new FinalScoreCalculationHandler(this.config.finalScoreCalculationConfig);
        const finalSoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);
        const averageScoreTo1000Handler = new AverageScoreTo1000Handler(this.config.averageScoreTo1000Config);

        semesterHandler
            .setNext(subjectGroupFilterHandler)
            .setNext(gradeConversionHandler)
            .setNext(percentileGradeHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(topCourseSelectionHandler)
            .setNext(defaultScoreFillerHandler)
            .setNext(finalScoreCalculationHandler)
            .setNext(finalSoreRoundingHandler)
            .setNext(averageScoreTo1000Handler);

        this.handler = semesterHandler;
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
        return SungkyulConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return SungkyulConfig.UNIT_CODE_TO_NAME;
    }
}
