import { SubjectScore } from '../entities/subject-score.entity';

export interface SubjectScoreRepositoryInterface {
    saveMany(scores: SubjectScore[]): Promise<SubjectScore[]>;
    findByStudentBaseInfoId(studentBaseInfoId: number): Promise<SubjectScore[]>;
    countByStudentBaseInfoId(studentBaseInfoId: number): Promise<number>;
    countByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<number>;
    deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void>;
    deleteByStudentBaseInfoId(studentBaseInfoId: number): Promise<void>;
    findById(id: number): Promise<SubjectScore | null>;
    save(score: SubjectScore): Promise<SubjectScore>;
    delete(id: number): Promise<void>;
}
