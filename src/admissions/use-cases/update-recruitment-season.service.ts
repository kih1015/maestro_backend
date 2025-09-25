import { Injectable, NotFoundException } from '@nestjs/common';
import { AdmissionsRepository } from '../admissions.repository';
import { RecruitmentSeason } from '../entities/recruitment-season.entity';
import { UpdateRecruitmentSeasonData } from '../interfaces/recruitment-season.service.interface';

@Injectable()
export class UpdateRecruitmentSeasonService {
    constructor(private admissionsRepository: AdmissionsRepository) {}

    async execute(id: number, data: UpdateRecruitmentSeasonData): Promise<RecruitmentSeason> {
        const existingSeason = await this.admissionsRepository.findById(id);
        if (!existingSeason) {
            throw new NotFoundException('Recruitment season not found');
        }

        const updatedSeason = existingSeason.update({
            admissionYear: data.admissionYear,
            admissionName: data.admissionName,
            admissionTypes: data.admissionTypes,
            recruitmentUnits: data.recruitmentUnits,
        });

        return await this.admissionsRepository.update(id, updatedSeason);
    }
}
