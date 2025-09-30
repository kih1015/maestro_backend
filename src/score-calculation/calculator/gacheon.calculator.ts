import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { ScoreCalculationContext } from '../handlers/base-handler';
import { GCNValidationHandler } from '../handlers/gcn-validation-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { CourseGroupFilterHandler } from '../handlers/course-group-filter-handler';
import { ExcludedSubjectHandler } from '../handlers/excluded-subject-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { RawScoreConversionHandler } from '../handlers/raw-score-conversion-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { GacheonConfig } from '../config/gacheon.config';

@Injectable()
export class GacheonCalculator implements Calculator {
    private readonly type = CalculatorEnum.GACHEON;
    private readonly config = new GacheonConfig();

    support(calculatorType: CalculatorEnum): boolean {
        return calculatorType === this.type;
    }

    calculate(student: Student): void {
        const context: ScoreCalculationContext = {
            student: student,
            shouldContinue: true,
        };

        this.createHandlerChain().handle(context);
    }

    private createHandlerChain() {
        const validationHandler = new GCNValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler();
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);
        const courseGroupHandler = new CourseGroupFilterHandler(this.config.subjectSeparationsConfigs);
        const excludedSubjectHandler = new ExcludedSubjectHandler(this.config.excludedSubjectConfig);
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const rawScoreConversionHandler = new RawScoreConversionHandler(this.config.rawScoreConversionConfig);
        const finalScoreHandler = new FinalScoreCalculationHandler(this.config.finalScoreConfig);

        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupHandler)
            .setNext(courseGroupHandler)
            .setNext(excludedSubjectHandler)
            .setNext(gradeConversionHandler)
            .setNext(rawScoreConversionHandler)
            .setNext(finalScoreHandler);

        return validationHandler;
    }
}
