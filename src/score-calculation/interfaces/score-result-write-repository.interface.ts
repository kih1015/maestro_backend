import { StudentScoreResult } from '../entities/student.entity';

export interface IScoreResultWriteRepository {
    createMany(results: StudentScoreResult[]): Promise<void>;
    deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void>;
}
