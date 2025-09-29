import { Student } from './student.entity';
import { ScoreCalculationContext } from '../handlers/base-handler';
import GCNAdmissionConfig from './gcn-admission-rules';
import { GCNValidationHandler } from '../handlers/gcn-validation-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { CourseGroupFilterHandler } from '../handlers/course-group-filter-handler';
import { ExcludedSubjectHandler } from '../handlers/excluded-subject-handler';
import { ScoreConversionHandler } from '../handlers/score-conversion-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';

export class GCNStudent extends Student {
    public override calculate(): void {
        const context: ScoreCalculationContext = {
            student: this,
            shouldContinue: true,
        };

        this.createHandlerChain().handle(context);
    }

    private createHandlerChain() {
        const config = new GCNAdmissionConfig();

        const validationHandler = new GCNValidationHandler(config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler();
        const subjectGroupHandler = new SubjectGroupFilterHandler(config.subjectConfigs);
        const courseGroupHandler = new CourseGroupFilterHandler(config.courseGroupConfigs);
        const excludedSubjectHandler = new ExcludedSubjectHandler(config.excludedSubjectConfig);
        const scoreConversionHandler = new ScoreConversionHandler(config.scoreConversionConfigs);
        const finalScoreHandler = new FinalScoreCalculationHandler(config.finalScoreConfig);

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
