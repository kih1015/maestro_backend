import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AdmissionsRepository } from './admissions.repository';
import { RecruitmentSeason } from './entities/recruitment-season.entity';
import { CreateRecruitmentSeasonDto } from './dto/create-recruitment-season.dto';
import { UpdateRecruitmentSeasonDto } from './dto/update-recruitment-season.dto';
import { RecruitmentSeasonResponseDto } from './dto/recruitment-season-response.dto';

@Injectable()
export class AdmissionsService {
    constructor(private admissionsRepository: AdmissionsRepository) {}

    async createRecruitmentSeason(createDto: CreateRecruitmentSeasonDto): Promise<RecruitmentSeasonResponseDto> {
        // Validate uniqueness of admission types
        this.validateAdmissionTypesUniqueness(createDto.admissionTypes);

        // Validate uniqueness of recruitment units
        this.validateRecruitmentUnitsUniqueness(createDto.recruitmentUnits);

        const recruitmentSeason = RecruitmentSeason.of({
            id: 0, // Will be set by database
            universityCode: createDto.universityCode,
            admissionYear: createDto.admissionPeriod.admissionYear,
            admissionName: createDto.admissionPeriod.admissionName,
            admissionTypes: createDto.admissionTypes,
            recruitmentUnits: createDto.recruitmentUnits,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const savedSeason = await this.admissionsRepository.create(recruitmentSeason);
        return this.mapToResponseDto(savedSeason);
    }

    async getAllRecruitmentSeasons(universityCode?: string): Promise<RecruitmentSeasonResponseDto[]> {
        let seasons: RecruitmentSeason[];

        if (universityCode) {
            seasons = await this.admissionsRepository.findByUniversityCode(universityCode);
        } else {
            seasons = await this.admissionsRepository.findAll();
        }

        return seasons.map(this.mapToResponseDto);
    }

    async getRecruitmentSeasonById(id: number): Promise<RecruitmentSeasonResponseDto> {
        const season = await this.admissionsRepository.findById(id);
        if (!season) {
            throw new NotFoundException('Recruitment season not found');
        }
        return this.mapToResponseDto(season);
    }

    async updateRecruitmentSeason(
        id: number,
        updateDto: UpdateRecruitmentSeasonDto,
    ): Promise<RecruitmentSeasonResponseDto> {
        const existingSeason = await this.admissionsRepository.findById(id);
        if (!existingSeason) {
            throw new NotFoundException('Recruitment season not found');
        }

        // Validate uniqueness of admission types
        this.validateAdmissionTypesUniqueness(updateDto.admissionTypes);

        // Validate uniqueness of recruitment units
        this.validateRecruitmentUnitsUniqueness(updateDto.recruitmentUnits);

        const updatedSeason = existingSeason.update({
            admissionYear: updateDto.admissionPeriod.admissionYear,
            admissionName: updateDto.admissionPeriod.admissionName,
            admissionTypes: updateDto.admissionTypes,
            recruitmentUnits: updateDto.recruitmentUnits,
        });

        const savedSeason = await this.admissionsRepository.update(id, updatedSeason);
        return this.mapToResponseDto(savedSeason);
    }

    async deleteRecruitmentSeason(id: number): Promise<void> {
        const exists = await this.admissionsRepository.exists(id);
        if (!exists) {
            throw new NotFoundException('Recruitment season not found');
        }

        await this.admissionsRepository.delete(id);
    }

    private validateAdmissionTypesUniqueness(admissionTypes: any[]): void {
        const typeNames = admissionTypes.map(type => type.typeName);
        const typeCodes = admissionTypes.map(type => type.typeCode);

        if (new Set(typeNames).size !== typeNames.length) {
            throw new ConflictException('Admission type names must be unique');
        }

        if (new Set(typeCodes).size !== typeCodes.length) {
            throw new ConflictException('Admission type codes must be unique');
        }
    }

    private validateRecruitmentUnitsUniqueness(recruitmentUnits: any[]): void {
        const unitNames = recruitmentUnits.map(unit => unit.unitName);
        const unitCodes = recruitmentUnits.map(unit => unit.unitCode);

        if (new Set(unitNames).size !== unitNames.length) {
            throw new ConflictException('Recruitment unit names must be unique');
        }

        if (new Set(unitCodes).size !== unitCodes.length) {
            throw new ConflictException('Recruitment unit codes must be unique');
        }
    }

    private mapToResponseDto(season: RecruitmentSeason): RecruitmentSeasonResponseDto {
        return {
            id: season.id,
            universityCode: season.universityCode,
            admissionYear: season.admissionYear,
            admissionName: season.admissionName,
            admissionTypes: season.admissionTypes,
            recruitmentUnits: season.recruitmentUnits,
            createdAt: season.createdAt.toISOString(),
            updatedAt: season.updatedAt.toISOString(),
        };
    }
}
