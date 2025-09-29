import { Student } from '../entities/student.entity';

export interface Calculator {
    readonly type: string;
    calculate(student: Student): void;
}
