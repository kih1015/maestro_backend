import { RecruitmentSeason } from '../entities/recruitment-season.entity';

export interface RecruitmentSeasonRepositoryInterface {
    findAll(): Promise<RecruitmentSeason[]>;
    findById(id: number): Promise<RecruitmentSeason | null>;
    findByUniversityCode(universityCode: string): Promise<RecruitmentSeason[]>;
    create(recruitmentSeason: RecruitmentSeason): Promise<RecruitmentSeason>;
    update(id: number, recruitmentSeason: RecruitmentSeason): Promise<RecruitmentSeason>;
    delete(id: number): Promise<void>;
    exists(id: number): Promise<boolean>;
}
