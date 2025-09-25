import { StudentScoreResult } from '../entities/student.entity';

export interface IStudentScoreResultRepository {
    /**
     * Create multiple student score results in batch
     */
    createMany(results: StudentScoreResult[]): Promise<void>;

    /**
     * Delete all results for a recruitment season
     */
    deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void>;
}
