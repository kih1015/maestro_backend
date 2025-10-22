import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { CourseGroupFilterHandler } from '../handlers/course-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { TopCourseSelectionHandler } from '../handlers/top-course-selection-handler';
import { WeightedFinalScoreCalculationHandler } from '../handlers/weighted-finalScore-calculation-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { KyungheeConfig } from '../config/kyunghee.config';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';
import { WeightApplyHandler } from '../handlers/weight-apply-handler';
import { GraduationEligibilityHandler } from '../handlers/graduation-eligibility-handler';
import { FinalGradeToScoreConfig, FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';
import { FinalGradeToScoreHandler } from '../handlers/final-grade-to-score-handler';

@Injectable()
export class KyungheeCalculator implements Calculator {
    private readonly type = CalculatorEnum.KYUNGHEE;
    private readonly config = new KyungheeConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const graduationEligibilityHandler = new GraduationEligibilityHandler(this.config.graduationEligibilityConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);
        const courseGroupHandler = new CourseGroupFilterHandler(this.config.subjectSeparationsConfigs);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const achievementToGradeConversionHandler = new AchievementToGradeConversionHandler(
            this.config.achievementToGradeConfig,
        );
        const topCourseSelectionHandler = new TopCourseSelectionHandler(this.config.topCourseSelectionConfig);
        const weightedScoreHandler = new WeightedFinalScoreCalculationHandler(this.config.weightedFinalScoreConfig);
        const weightApplyHandler = new WeightApplyHandler(this.config.weightApplyConfig);
        const finalSoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);

        graduationEligibilityHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupHandler)
            .setNext(courseGroupHandler)
            .setNext(gradeConversionHandler)
            .setNext(achievementToGradeConversionHandler)
            .setNext(topCourseSelectionHandler)
            .setNext(weightedScoreHandler)
            .setNext(weightApplyHandler)
            .setNext(finalSoreRoundingHandler);

        this.handler = graduationEligibilityHandler;
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
        return KyungheeConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return KyungheeConfig.UNIT_CODE_TO_NAME;
    }
}
