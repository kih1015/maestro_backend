import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface ISubjectDetailWriteRepository {
    saveMany(details: SubjectScoreCalculationDetail[]): Promise<void>;
    deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void>;
}
