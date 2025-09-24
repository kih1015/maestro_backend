import { SubjectGroupMapping } from '../entities/subject-group-mapping.entity';

export interface SubjectGroupMappingRepositoryInterface {
    saveMany(mappings: SubjectGroupMapping[]): Promise<SubjectGroupMapping[]>;
    findByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<SubjectGroupMapping[]>;
    countByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<number>;
    deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void>;
    findById(id: number): Promise<SubjectGroupMapping | null>;
    save(mapping: SubjectGroupMapping): Promise<SubjectGroupMapping>;
    delete(id: number): Promise<void>;
}
