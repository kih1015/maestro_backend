import { Injectable, NotFoundException } from '@nestjs/common';
import { AdmissionsRepository } from '../admissions.repository';
import { RecruitmentSeason } from '../entities/recruitment-season.entity';

@Injectable()
export class GetRecruitmentSeasonsService {
    constructor(private admissionsRepository: AdmissionsRepository) {}

    async getAllRecruitmentSeasons(universityCode?: string): Promise<RecruitmentSeason[]> {
        if (universityCode) {
            return await this.admissionsRepository.findByUniversityCode(universityCode);
        } else {
            return await this.admissionsRepository.findAll();
        }
    }

    async getRecruitmentSeasonById(id: number): Promise<RecruitmentSeason> {
        const season = await this.admissionsRepository.findById(id);
        if (!season) {
            throw new NotFoundException('Recruitment season not found');
        }
        return season;
    }
}
