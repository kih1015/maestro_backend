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

export class GCNStudent extends Student {
    public override calculate(): void {
        const context: ScoreCalculationContext = {
            student: this,
            shouldContinue: true,
        };

        this.createHandlerChain().handle(context);
    }

    private createHandlerChain() {
        const validationHandler = new GCNValidationHandler();
        const semesterHandler = new SemesterReflectionHandler();
        const subjectGroupHandler = new SubjectGroupFilterHandler();
        const courseGroupHandler = new CourseGroupFilterHandler();
        const excludedSubjectHandler = new ExcludedSubjectHandler();
        const scoreConversionHandler = new ScoreConversionHandler();
        const finalScoreHandler = new FinalScoreCalculationHandler();

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
