import { Injectable, NotFoundException } from '@nestjs/common';
import { AdmissionsRepository } from '../repositories/admissions.repository';
import { RecruitmentSeason } from '../entities/recruitment-season.entity';

@Injectable()
export class GetRecruitmentSeasonsService {
    constructor(private admissionsRepository: AdmissionsRepository) {}

    async getRecruitmentSeasonsByUserId(userId: number): Promise<RecruitmentSeason[]> {
        return await this.admissionsRepository.findByUserId(userId);
    }

    async getRecruitmentSeasonById(id: number): Promise<RecruitmentSeason> {
        const season = await this.admissionsRepository.findById(id);
        if (!season) {
            throw new NotFoundException('Recruitment season not found');
        }
        return season;
    }
}
