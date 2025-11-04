import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { HanshinConfig } from '../config/hanshin.config';
import { StudentValidationHandler } from '../handlers/student-validation-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { TopCourseSelectionHandler } from '../handlers/top-course-selection-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { HanshinWeightedAverageHandler } from '../handlers/hanshin-weighted-average-handler';

@Injectable()
export class HanshinCalculator implements Calculator {
    private readonly type = CalculatorEnum.HANSHIN;
    private readonly config = new HanshinConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupFilterHandler = new SubjectGroupFilterHandler(this.config.subjectGroupFilterConfig);
        const gradeConversionHandlerNonEssay = new GradeConversionHandler(this.config.gradeConversionConfigNonEssay);
        const gradeConversionHandlerEssay = new GradeConversionHandler(this.config.gradeConversionConfigEssay);
        const topCourseSelectionHandler = new TopCourseSelectionHandler(this.config.topCourseSelectionConfig);
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const weightedAverageHandlerNonEssay = new HanshinWeightedAverageHandler(
            this.config.weightedAverageConfigNonEssay,
        );
        const weightedAverageHandlerEssay = new HanshinWeightedAverageHandler(this.config.weightedAverageConfigEssay);

        // 핸들러 체이닝
        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupFilterHandler)
            .setNext(gradeConversionHandlerNonEssay)
            .setNext(gradeConversionHandlerEssay)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(topCourseSelectionHandler)
            .setNext(weightedAverageHandlerNonEssay)
            .setNext(weightedAverageHandlerEssay);

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
        return HanshinConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return HanshinConfig.UNIT_CODE_TO_NAME;
    }
}
