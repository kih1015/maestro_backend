import { Student } from './student.entity';
import {
    GCNValidationHandler,
    SemesterReflectionHandler,
    SubjectGroupFilterHandler,
    CourseGroupFilterHandler,
    ExcludedSubjectHandler,
    ScoreConversionHandler,
    FinalScoreCalculationHandler,
} from '../handlers/gcn-handlers';
import { ScoreCalculationContext } from '../handlers/base-handler';
import { GCNAdmissionConfig } from './gcn-admission-rules';

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
