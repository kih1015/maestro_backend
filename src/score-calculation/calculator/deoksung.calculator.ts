import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { DeoksungConfig } from '../config/deoksung.config';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';
import { StudentValidationHandler } from '../handlers/student-validation-handler';
import { TopCourseSelectionHandler } from '../handlers/top-course-selection-handler';
import { WeightedFinalScoreCalculationHandler } from '../handlers/weighted-finalScore-calculation-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { AssessmentConversionHandler } from '../handlers/assessment-conversion-handler';
import { SubjectGroupMinimumUnitCheckHandler } from '../handlers/subject-group-minimum-unit-check-handler';
import { FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';

@Injectable()
export class DeoksungCalculator implements Calculator {
    private readonly type = CalculatorEnum.DEOKSUNG;
    private readonly config = new DeoksungConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);
        const commonGeneralGradeConversionHandler = new GradeConversionHandler(
            this.config.commonGeneralGradeConversionConfig,
        );
        const careerAchievementConversionHandler = new AchievementToGradeConversionHandler(
            this.config.careerAchievementConversionConfig,
        );
        const assessmentConversionHandler = new AssessmentConversionHandler(this.config.gradeConversionConfig);
        const top3CareerSelectionHandler = new TopCourseSelectionHandler(this.config.top3CareerSelectionConfig);
        const subjectGroupMinimumUnitCheckHandler = new SubjectGroupMinimumUnitCheckHandler(
            this.config.minimumUnitCheckConfig,
        );
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const weightedScoreHandler = new WeightedFinalScoreCalculationHandler(this.config.weightedFinalScoreConfig);
        const finalSoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);

        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupHandler)
            .setNext(commonGeneralGradeConversionHandler)
            .setNext(careerAchievementConversionHandler)
            .setNext(assessmentConversionHandler)
            .setNext(top3CareerSelectionHandler)
            .setNext(subjectGroupMinimumUnitCheckHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(weightedScoreHandler)
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
        return DeoksungConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return DeoksungConfig.UNIT_CODE_TO_NAME;
    }
}
