import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { ScoreCalculationContext } from '../handlers/base-handler';
import GacheonConfig from '../config/gacheon.config';
import { GCNValidationHandler } from '../handlers/gcn-validation-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { CourseGroupFilterHandler } from '../handlers/course-group-filter-handler';
import { ExcludedSubjectHandler } from '../handlers/excluded-subject-handler';
import { ScoreConversionHandler } from '../handlers/score-conversion-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GacheonCalculator implements Calculator {
    readonly type = 'Gacheon';
    private readonly config = new GacheonConfig();

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
        const courseGroupHandler = new CourseGroupFilterHandler(this.config.courseGroupConfigs);
        const excludedSubjectHandler = new ExcludedSubjectHandler(this.config.excludedSubjectConfig);
        const scoreConversionHandler = new ScoreConversionHandler(this.config.scoreConversionConfigs);
        const finalScoreHandler = new FinalScoreCalculationHandler(this.config.finalScoreConfig);

        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupHandler)
            .setNext(courseGroupHandler)
            .setNext(excludedSubjectHandler)
            .setNext(scoreConversionHandler)
            .setNext(finalScoreHandler);

        return validationHandler;
    }
}
