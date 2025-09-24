import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface ISubjectScoreCalculationDetailRepository {
    /**
     * Save multiple calculation details in batch
     */
    saveMany(details: SubjectScoreCalculationDetail[]): Promise<void>;

    /**
     * Delete all details for a recruitment season
     */
    deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void>;

    /**
     * Find details by subject score IDs
     */
    findBySubjectScoreIds(subjectScoreIds: number[]): Promise<SubjectScoreCalculationDetail[]>;

    /**
     * Find detail by subject score ID
     */
    findBySubjectScoreId(subjectScoreId: number): Promise<SubjectScoreCalculationDetail | null>;

    /**
     * Update existing detail
     */
    update(id: number, detail: Partial<SubjectScoreCalculationDetail>): Promise<SubjectScoreCalculationDetail>;
}
