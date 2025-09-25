import { Injectable } from '@nestjs/common';
import { AdmissionsRepository } from '../admissions.repository';
import { RecruitmentSeason } from '../entities/recruitment-season.entity';
import { CreateRecruitmentSeasonData } from '../interfaces/recruitment-season.service.interface';

@Injectable()
export class CreateRecruitmentSeasonService {
    constructor(private admissionsRepository: AdmissionsRepository) {}

    async execute(data: CreateRecruitmentSeasonData): Promise<RecruitmentSeason> {
        const recruitmentSeason = RecruitmentSeason.of({
            id: 0,
            universityCode: data.universityCode,
            admissionYear: data.admissionYear,
            admissionName: data.admissionName,
            admissionTypes: data.admissionTypes,
            recruitmentUnits: data.recruitmentUnits,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return await this.admissionsRepository.create(recruitmentSeason);
    }
}
