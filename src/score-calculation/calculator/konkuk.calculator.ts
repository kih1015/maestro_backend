import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { CourseGroupFilterHandler } from '../handlers/course-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { TopCourseSelectionHandler } from '../handlers/top-course-selection-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { KonkukConfig } from '../config/konkuk.config';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';
import { WeightApplyHandler } from '../handlers/weight-apply-handler';
import { FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { SubjectWeightedAverageHandler } from '../handlers/subject-weighted-average-handler';
import { StudentValidationHandler } from '../handlers/student-validation-handler';

@Injectable()
export class KonkukCalculator implements Calculator {
    private readonly type = CalculatorEnum.KONKUK;
    private readonly config = new KonkukConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);
        const courseGroupHandler = new CourseGroupFilterHandler(this.config.subjectSeparationsConfigs);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const achievementToGradeConversionHandler = new AchievementToGradeConversionHandler(
            this.config.achievementToGradeConfig,
        );
        const topCourseSelectionHandler = new TopCourseSelectionHandler(this.config.topCourseSelectionConfig);
        const finalScoreHandler = new FinalScoreCalculationHandler(this.config.finalScoreConfig);
        const subjectWeightedAverageHandler = new SubjectWeightedAverageHandler(
            this.config.subjectWeightedAverageConfig,
        );
        const weightApplyHandler = new WeightApplyHandler(this.config.weightApplyConfig);
        const finalSoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);

        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupHandler)
            .setNext(courseGroupHandler)
            .setNext(gradeConversionHandler)
            .setNext(achievementToGradeConversionHandler)
            .setNext(topCourseSelectionHandler)
            .setNext(finalScoreHandler)
            .setNext(subjectWeightedAverageHandler)
            .setNext(weightApplyHandler)
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
        return KonkukConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return KonkukConfig.UNIT_CODE_TO_NAME;
    }
}
