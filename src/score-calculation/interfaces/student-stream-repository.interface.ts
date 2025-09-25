import { Student } from '../entities/student.entity';

export interface IStudentStreamRepository {
    streamStudents(recruitmentSeasonId: number, lastId: number | null, batchSize: number): Promise<Student[]>;
}
