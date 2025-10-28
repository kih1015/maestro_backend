import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { SeoultechConfig } from '../config/seoultech.config';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { StudentValidationHandlerV2 } from '../handlers/studnet-validation-handler-v2';
import { TopCourseSelectionHandler } from '../handlers/top-course-selection-handler';
import { FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';
import { MinimumUnitRequirementHandler } from '../handlers/minimum-unit-requirement-handler';

@Injectable()
export class SeoultechCalculator implements Calculator {
    private readonly type = CalculatorEnum.SEOULTECH;
    private readonly config = new SeoultechConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandlerV2(this.config.validationV2Config);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const specialGradeConversionHandler = new GradeConversionHandler(this.config.specialGradeConversionConfig);
        const careerAchievementConversionHandler = new AchievementToGradeConversionHandler(
            this.config.careerAchievementConversionConfig,
        );
        // const professionalAchievementConversionHandler = new AchievementToGradeConversionHandler(
        //     this.config.professionalAchievementConversionConfig,
        // );
        const top3CareerHandler = new TopCourseSelectionHandler(this.config.top3CareerSelectionConfig);
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const minimumUnitRequirementHandler = new MinimumUnitRequirementHandler(
            this.config.minimumUnitRequirementConfig,
        );
        const finalScoreHandler = new FinalScoreCalculationHandler(this.config.finalScoreConfig);
        const finalScoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);

        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupHandler)
            .setNext(gradeConversionHandler)
            .setNext(specialGradeConversionHandler)
            .setNext(careerAchievementConversionHandler)
            .setNext(minimumUnitRequirementHandler)
            .setNext(top3CareerHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(finalScoreHandler)
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
        return SeoultechConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return SeoultechConfig.UNIT_CODE_TO_NAME;
    }
}
