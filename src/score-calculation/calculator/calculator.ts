import { Student } from '../entities/student.entity';
import { type CalculatorEnum } from './calculator.enum';
import { HandlerInfo } from '../handlers/base-handler';

export interface Calculator {
    support(calculatorType: CalculatorEnum): boolean;
    calculate(student: Student): void;
    getCalculatorInfo(): HandlerInfo[];
    getAdmissionMapper(): Record<string, string>;
    getUnitMapper(): Record<string, string>;
}
