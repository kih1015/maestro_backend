import { Student } from '../entities/student.entity';
import { type CalculatorEnum } from './calculator.enum';

export interface Calculator {
    readonly type: CalculatorEnum;
    calculate(student: Student): void;
}
