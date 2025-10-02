import { Student } from '../entities/student.entity';

export interface ScoreCalculationContext {
    student: Student;
    shouldContinue: boolean;
    metadata?: Record<string, any>;
}

export interface HandlerInfo {
    type: 'filter' | 'converter' | 'calc';
    subject: string;
    description: string;
    handlerType: string;
    config: Array<{
        admissions: string[];
        units: string[];
        excludedGroup?: string[];
        includedGroup?: string[];
        mappingTable?: Array<{ key: string; value: string }>;
        formula?: string;
    }>;
}

export abstract class BaseScoreHandler {
    private nextHandler?: BaseScoreHandler;
    protected abstract readonly handlerType: string;

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

    public listInfo(): HandlerInfo[] {
        const info: HandlerInfo[] = [this.getInfo()];

        if (this.nextHandler) {
            info.push(...this.nextHandler.listInfo());
        }

        return info;
    }

    public abstract getInfo(): HandlerInfo;
}
