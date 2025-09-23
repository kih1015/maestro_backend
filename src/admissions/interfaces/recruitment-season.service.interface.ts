import { RecruitmentSeason } from '../entities/recruitment-season.entity';
import { AdmissionType, RecruitmentUnit } from '../entities/recruitment-season.entity';

export interface CreateRecruitmentSeasonData {
    universityCode: string;
    admissionYear: number;
    admissionName: string;
    admissionTypes: AdmissionType[];
    recruitmentUnits: RecruitmentUnit[];
}

export interface UpdateRecruitmentSeasonData {
    admissionYear: number;
    admissionName: string;
    admissionTypes: AdmissionType[];
    recruitmentUnits: RecruitmentUnit[];
}

export interface RecruitmentSeasonServiceInterface {
    createRecruitmentSeason(data: CreateRecruitmentSeasonData): Promise<RecruitmentSeason>;
    getAllRecruitmentSeasons(universityCode?: string): Promise<RecruitmentSeason[]>;
    getRecruitmentSeasonById(id: number): Promise<RecruitmentSeason>;
    updateRecruitmentSeason(id: number, data: UpdateRecruitmentSeasonData): Promise<RecruitmentSeason>;
    deleteRecruitmentSeason(id: number): Promise<void>;
}
