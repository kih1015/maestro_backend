import { Student } from '../entities/student.entity';

export interface ScoreCalculationContext {
    student: Student;
    shouldContinue: boolean;
    metadata?: Record<string, any>;
}

export abstract class BaseScoreHandler {
    private nextHandler?: BaseScoreHandler;

    public setNext(handler: BaseScoreHandler): BaseScoreHandler {
        this.nextHandler = handler;
        return handler;
    }

    public handle(context: ScoreCalculationContext): void {
        if (context.shouldContinue) {
            this.process(context);
        }

        if (this.nextHandler && context.shouldContinue) {
            this.nextHandler.handle(context);
        }
    }

    protected abstract process(context: ScoreCalculationContext): void;
}
