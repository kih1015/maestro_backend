import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { MyongjiConfig } from '../config/myongji.config';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';
import { GCNValidationHandler } from '../handlers/gcn-validation-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { CreditBonusHandler } from '../handlers/credit-bonus-handler';
import { FinalSoreRoundingHandler } from '../handlers/final-score-rounding-handler';
import { WeightApplyHandler } from '../handlers/weight-apply-handler';
import { AssessmentConversionHandler } from '../handlers/assessment-conversion-handler';

@Injectable()
export class MyongjiCalculator implements Calculator {
    private readonly type = CalculatorEnum.MYONGJI;
    private readonly config = new MyongjiConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new GCNValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);
        const commonGeneralGradeConversionHandler = new GradeConversionHandler(
            this.config.commonGeneralGradeConversionConfig,
        );
        const careerAchievementConversionHandler = new AchievementToGradeConversionHandler(
            this.config.careerAchievementConversionConfig,
        );
        const assessmentConversionHandler = new AssessmentConversionHandler(this.config.gradeConversionConfig);

        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const finalScoreHandler = new FinalScoreCalculationHandler(this.config.finalScoreConfig);
        const creditBonusHandler = new CreditBonusHandler(this.config.creditBonusConfig);
        const finalScoreRoundingHandler = new FinalSoreRoundingHandler(this.config.finalGradeToScoreConfig);
        const weightApplyHandler = new WeightApplyHandler(this.config.weightApplyConfig);

        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupHandler)
            .setNext(commonGeneralGradeConversionHandler)
            .setNext(careerAchievementConversionHandler)
            .setNext(assessmentConversionHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(finalScoreHandler)
            .setNext(creditBonusHandler)
            .setNext(finalScoreRoundingHandler)
            .setNext(weightApplyHandler);

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
        return MyongjiConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return MyongjiConfig.UNIT_CODE_TO_NAME;
    }
}
