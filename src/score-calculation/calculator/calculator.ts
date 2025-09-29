import { Student } from '../entities/student.entity';
import { type CalculatorEnum } from './calculator.enum';

export interface Calculator {
    support(calculatorType: CalculatorEnum): boolean;
    calculate(student: Student): void;
}
