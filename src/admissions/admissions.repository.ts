import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecruitmentSeason } from './entities/recruitment-season.entity';
import { RecruitmentSeasonRepositoryInterface } from './interfaces/recruitment-season.repository.interface';

interface PrismaRecruitmentSeasonWithRelations {
    id: number;
    universityCode: string;
    admissionYear: number;
    admissionName: string;
    createdAt: Date;
    updatedAt: Date;
    admission_types: Array<{
        typeName: string;
        typeCode: number;
    }>;
    recruitment_units: Array<{
        unitName: string;
        unitCode: number;
    }>;
}

@Injectable()
export class AdmissionsRepository implements RecruitmentSeasonRepositoryInterface {
    constructor(private prisma: PrismaService) {}

    async findAll(): Promise<RecruitmentSeason[]> {
        const results = await this.prisma.recruitment_seasons.findMany({
            include: {
                admission_types: true,
                recruitment_units: true,
            },
            orderBy: {
                admissionYear: 'desc',
            },
        });

        return results.map(result => this.mapToEntity(result));
    }

    async findById(id: number): Promise<RecruitmentSeason | null> {
        const result = await this.prisma.recruitment_seasons.findUnique({
            where: { id },
            include: {
                admission_types: true,
                recruitment_units: true,
            },
        });

        return result ? this.mapToEntity(result) : null;
    }

    async findByUniversityCode(universityCode: string): Promise<RecruitmentSeason[]> {
        const results = await this.prisma.recruitment_seasons.findMany({
            where: { universityCode },
            include: {
                admission_types: true,
                recruitment_units: true,
            },
            orderBy: {
                admissionYear: 'desc',
            },
        });

        return results.map(result => this.mapToEntity(result));
    }

    async create(recruitmentSeason: RecruitmentSeason): Promise<RecruitmentSeason> {
        const result = await this.prisma.recruitment_seasons.create({
            data: {
                universityCode: recruitmentSeason.universityCode,
                admissionYear: recruitmentSeason.admissionYear,
                admissionName: recruitmentSeason.admissionName,
                updatedAt: new Date(),
                admission_types: {
                    create: recruitmentSeason.admissionTypes.map(type => ({
                        typeName: type.typeName,
                        typeCode: type.typeCode,
                    })),
                },
                recruitment_units: {
                    create: recruitmentSeason.recruitmentUnits.map(unit => ({
                        unitName: unit.unitName,
                        unitCode: unit.unitCode,
                    })),
                },
            },
            include: {
                admission_types: true,
                recruitment_units: true,
            },
        });

        return this.mapToEntity(result);
    }

    async update(id: number, recruitmentSeason: RecruitmentSeason): Promise<RecruitmentSeason> {
        // Delete existing admission types and recruitment units
        await this.prisma.admission_types.deleteMany({
            where: { recruitmentSeasonId: id },
        });
        await this.prisma.recruitment_units.deleteMany({
            where: { recruitmentSeasonId: id },
        });

        // Update the recruitment season with new data
        const result = await this.prisma.recruitment_seasons.update({
            where: { id },
            data: {
                admissionYear: recruitmentSeason.admissionYear,
                admissionName: recruitmentSeason.admissionName,
                updatedAt: new Date(),
                admission_types: {
                    create: recruitmentSeason.admissionTypes.map(type => ({
                        typeName: type.typeName,
                        typeCode: type.typeCode,
                    })),
                },
                recruitment_units: {
                    create: recruitmentSeason.recruitmentUnits.map(unit => ({
                        unitName: unit.unitName,
                        unitCode: unit.unitCode,
                    })),
                },
            },
            include: {
                admission_types: true,
                recruitment_units: true,
            },
        });

        return this.mapToEntity(result);
    }

    async delete(id: number): Promise<void> {
        await this.prisma.recruitment_seasons.delete({
            where: { id },
        });
    }

    async exists(id: number): Promise<boolean> {
        const count = await this.prisma.recruitment_seasons.count({
            where: { id },
        });
        return count > 0;
    }

    private mapToEntity(data: PrismaRecruitmentSeasonWithRelations): RecruitmentSeason {
        return RecruitmentSeason.of({
            id: data.id,
            universityCode: data.universityCode,
            admissionYear: data.admissionYear,
            admissionName: data.admissionName,
            admissionTypes: data.admission_types.map(type => ({
                typeName: type.typeName,
                typeCode: type.typeCode,
            })),
            recruitmentUnits: data.recruitment_units.map(unit => ({
                unitName: unit.unitName,
                unitCode: unit.unitCode,
            })),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
}
