import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AdmissionsRepository } from './admissions.repository';
import { RecruitmentSeason, AdmissionType, RecruitmentUnit } from './entities/recruitment-season.entity';
import {
    CreateRecruitmentSeasonData,
    UpdateRecruitmentSeasonData,
    RecruitmentSeasonServiceInterface,
} from './interfaces/recruitment-season.service.interface';

@Injectable()
export class AdmissionsService implements RecruitmentSeasonServiceInterface {
    constructor(private admissionsRepository: AdmissionsRepository) {}

    async createRecruitmentSeason(data: CreateRecruitmentSeasonData): Promise<RecruitmentSeason> {
        // Validate uniqueness of admission types
        this.validateAdmissionTypesUniqueness(data.admissionTypes);

        // Validate uniqueness of recruitment units
        this.validateRecruitmentUnitsUniqueness(data.recruitmentUnits);

        const recruitmentSeason = RecruitmentSeason.of({
            id: 0, // Will be set by database
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

    async updateRecruitmentSeason(id: number, data: UpdateRecruitmentSeasonData): Promise<RecruitmentSeason> {
        const existingSeason = await this.admissionsRepository.findById(id);
        if (!existingSeason) {
            throw new NotFoundException('Recruitment season not found');
        }

        // Validate uniqueness of admission types
        this.validateAdmissionTypesUniqueness(data.admissionTypes);

        // Validate uniqueness of recruitment units
        this.validateRecruitmentUnitsUniqueness(data.recruitmentUnits);

        const updatedSeason = existingSeason.update({
            admissionYear: data.admissionYear,
            admissionName: data.admissionName,
            admissionTypes: data.admissionTypes,
            recruitmentUnits: data.recruitmentUnits,
        });

        return await this.admissionsRepository.update(id, updatedSeason);
    }

    async deleteRecruitmentSeason(id: number): Promise<void> {
        const exists = await this.admissionsRepository.exists(id);
        if (!exists) {
            throw new NotFoundException('Recruitment season not found');
        }

        await this.admissionsRepository.delete(id);
    }

    private validateAdmissionTypesUniqueness(admissionTypes: AdmissionType[]): void {
        const typeNames = admissionTypes.map(type => type.typeName);
        const typeCodes = admissionTypes.map(type => type.typeCode);

        if (new Set(typeNames).size !== typeNames.length) {
            throw new ConflictException('Admission type names must be unique');
        }

        if (new Set(typeCodes).size !== typeCodes.length) {
            throw new ConflictException('Admission type codes must be unique');
        }
    }

    private validateRecruitmentUnitsUniqueness(recruitmentUnits: RecruitmentUnit[]): void {
        const unitNames = recruitmentUnits.map(unit => unit.unitName);
        const unitCodes = recruitmentUnits.map(unit => unit.unitCode);

        if (new Set(unitNames).size !== unitNames.length) {
            throw new ConflictException('Recruitment unit names must be unique');
        }

        if (new Set(unitCodes).size !== unitCodes.length) {
            throw new ConflictException('Recruitment unit codes must be unique');
        }
    }
}
