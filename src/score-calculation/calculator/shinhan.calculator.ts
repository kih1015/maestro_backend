import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { ShinhanConfig } from '../config/shinhan.config';
import { StudentValidationHandler } from '../handlers/student-validation-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { PercentileGradeConversionHandler } from '../handlers/percentile-grade-conversion-handler';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';
import { TopCourseSelectionHandler } from '../handlers/top-course-selection-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { AverageGradeCalculationHandler } from '../handlers/average-grade-calculation-handler';
import { FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';

@Injectable()
export class ShinhanCalculator implements Calculator {
    private readonly type = CalculatorEnum.SHINHAN;
    private readonly config = new ShinhanConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupFilterHandler = new SubjectGroupFilterHandler(this.config.subjectGroupFilterConfig);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const percentileGradeHandler = new PercentileGradeConversionHandler(this.config.percentileGradeConfig);
        const achievementToGradeHandler = new AchievementToGradeConversionHandler(this.config.achievementToGradeConfig);
        const careerSubjectSelectionHandler = new TopCourseSelectionHandler(this.config.careerSubjectSelectionConfig);
        const topCourseSelectionHandler = new TopCourseSelectionHandler(this.config.topCourseSelectionConfig);
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const averageGradeCalculationHandler = new AverageGradeCalculationHandler(
            this.config.averageGradeCalculationConfig,
        );
        const finalSoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);

        // 핸들러 체이닝
        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupFilterHandler)
            .setNext(gradeConversionHandler)
            .setNext(percentileGradeHandler)
            .setNext(achievementToGradeHandler)
            .setNext(careerSubjectSelectionHandler)
            .setNext(topCourseSelectionHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(averageGradeCalculationHandler)
            .setNext(finalSoreRoundingHandler);

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
        return ShinhanConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return ShinhanConfig.UNIT_CODE_TO_NAME;
    }
}
