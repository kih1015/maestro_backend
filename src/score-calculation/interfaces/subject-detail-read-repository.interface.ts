import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface ISubjectDetailReadRepository {
    findBySubjectScoreIds(subjectScoreIds: number[]): Promise<SubjectScoreCalculationDetail[]>;
    findBySubjectScoreId(subjectScoreId: number): Promise<SubjectScoreCalculationDetail | null>;
}
