import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { SamyookConfig } from '../config/samyook.config';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { WeightApplyHandler } from '../handlers/weight-apply-handler';
import { StudentValidationHandlerV2 } from '../handlers/studnet-validation-handler-v2';
import { BestSubjectSelectionHandler } from '../handlers/best-subject-selection-handler';
import { FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';
import { SubjectGroupTransformHandler } from '../handlers/subject-group-transform-handler';

@Injectable()
export class SamyookCalculator implements Calculator {
    private readonly type = CalculatorEnum.SAMYOOK;
    private readonly config = new SamyookConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandlerV2(this.config.validationV2Config);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupTransformHandler = new SubjectGroupTransformHandler(this.config.subjectGroupTransformConfig);
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const careerAchievementConversionHandler = new AchievementToGradeConversionHandler(
            this.config.careerAchievementConversionConfig,
        );
        const bestSubjectHandler = new BestSubjectSelectionHandler(this.config.bestSubjectSelectionConfig);
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const finalScoreHandler = new FinalScoreCalculationHandler(this.config.finalScoreConfig);
        const finalScoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);
        const weightApplyHandler = new WeightApplyHandler(this.config.weightApplyConfig);

        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupTransformHandler)
            .setNext(subjectGroupHandler)
            .setNext(gradeConversionHandler)
            .setNext(careerAchievementConversionHandler)
            .setNext(bestSubjectHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(finalScoreHandler)
            .setNext(weightApplyHandler)
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
        return SamyookConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return SamyookConfig.UNIT_CODE_TO_NAME;
    }
}
