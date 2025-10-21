import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { GyeongbokConfig } from '../config/gyeongbok.config';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';
import { ZScoreGradeConversionHandler } from '../handlers/zscore-grade-conversion-handler';
import { PercentileGradeConversionHandler } from '../handlers/percentile-grade-conversion-handler';
import { BestSemesterSelectionHandler } from '../handlers/best-semester-selection-handler';
import { BestSubjectSelectionHandler } from '../handlers/best-subject-selection-handler';
import { FinalGradeToScoreHandler } from '../handlers/final-grade-to-score-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { WeightApplyHandler } from '../handlers/weight-apply-handler';

@Injectable()
export class GyeongbokCalculator implements Calculator {
    private readonly type = CalculatorEnum.GYEONGBOK;
    private readonly config = new GyeongbokConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const percentileGradeHandler = new PercentileGradeConversionHandler(this.config.percentileGradeConfig);
        const achievementToGradeHandler = new AchievementToGradeConversionHandler(this.config.achievementToGradeConfig);
        const zScoreGradeHandler = new ZScoreGradeConversionHandler(this.config.zScoreGradeConfig);
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const bestSemesterHandler = new BestSemesterSelectionHandler(this.config.bestSemesterSelectionConfig);
        const bestSubjectHandler = new BestSubjectSelectionHandler(this.config.bestSubjectSelectionConfig);
        const finalGradeToScoreHandler = new FinalGradeToScoreHandler(this.config.finalGradeToScoreConfig);
        const finalScoreHandler = new FinalScoreCalculationHandler(this.config.finalScoreConfig);
        const weightApplyHandler = new WeightApplyHandler(this.config.weightApplyConfig);

        semesterHandler
            .setNext(subjectGroupHandler)
            .setNext(gradeConversionHandler)
            .setNext(percentileGradeHandler)
            .setNext(achievementToGradeHandler)
            .setNext(zScoreGradeHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(bestSemesterHandler)
            .setNext(bestSubjectHandler)
            .setNext(finalScoreHandler)
            .setNext(finalGradeToScoreHandler)
            .setNext(weightApplyHandler);

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
        return GyeongbokConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return GyeongbokConfig.UNIT_CODE_TO_NAME;
    }
}
