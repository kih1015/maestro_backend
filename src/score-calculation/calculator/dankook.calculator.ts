import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { DankookConfig } from '../config/dankook.config';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';
import { FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { StudentValidationHandler } from '../handlers/student-validation-handler';
import { PercentileGradeConversionHandler } from '../handlers/percentile-grade-conversion-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { RequiredSubjectGroupHandler } from '../handlers/required-subject-group-handler';

@Injectable()
export class DankookCalculator implements Calculator {
    private readonly type = CalculatorEnum.DANKOOK;
    private readonly config = new DankookConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);
        const achievementToGradeConversionHandler = new AchievementToGradeConversionHandler(
            this.config.achievementToGradeConfig,
        );
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const percentileGradeConversionHandler = new PercentileGradeConversionHandler(
            this.config.percentileGradeConfig,
        );
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const requiredSubjectGroupHandler = new RequiredSubjectGroupHandler(
            this.config.requiredSubjectGroupConfig,
            DankookConfig.ADMISSION_CODE_TO_NAME,
            DankookConfig.UNIT_CODE_TO_NAME,
        );
        const finalScoreHandler = new FinalScoreCalculationHandler(this.config.finalScoreConfig);
        const finalSoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);

        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupHandler)
            .setNext(achievementToGradeConversionHandler)
            .setNext(gradeConversionHandler)
            .setNext(percentileGradeConversionHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(requiredSubjectGroupHandler)
            .setNext(finalScoreHandler)
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
        return DankookConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return DankookConfig.UNIT_CODE_TO_NAME;
    }
}
