import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecruitmentSeason } from '../entities/recruitment-season.entity';
import { RecruitmentSeasonRepositoryInterface } from '../interfaces/recruitment-season.repository.interface';
import { Prisma } from '@prisma/client';

/**
 * 모집 시즌 데이터베이스 액세스를 담당하는 리포지토리 클래스
 * Prisma ORM을 사용하여 PostgreSQL 데이터베이스와 상호작용합니다.
 * 모집 시즌과 관련된 전형 유형, 모집 단위 데이터의 CRUD 작업을 처리합니다.
 */
@Injectable()
export class AdmissionsRepository implements RecruitmentSeasonRepositoryInterface {
    constructor(private prisma: PrismaService) {}

    /**
     * 모든 모집 시즌을 조회합니다.
     * 입학 연도를 기준으로 내림차순 정렬하여 반환합니다.
     * @returns 전체 모집 시즌 목록 (전형 유형과 모집 단위 정보 포함)
     */
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

    /**
     * ID로 특정 모집 시즌을 조회합니다.
     * @param id 조회할 모집 시즌의 고유 식별자
     * @returns 조회된 모집 시즌 엔티티 또는 null (존재하지 않을 경우)
     */
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

    /**
     * 대학 코드로 모집 시즌을 조회합니다.
     * 입학 연도를 기준으로 내림차순 정렬하여 반환합니다.
     * @param universityCode 조회할 대학의 코드
     * @returns 해당 대학의 모집 시즌 목록
     */
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

    /**
     * 새로운 모집 시즌을 데이터베이스에 생성합니다.
     * 전형 유형과 모집 단위 정보도 함께 생성합니다.
     * @param recruitmentSeason 생성할 모집 시즌 엔티티
     * @returns 데이터베이스에 저장된 모집 시즌 엔티티
     */
    async create(recruitmentSeason: RecruitmentSeason): Promise<RecruitmentSeason> {
        const result = await this.prisma.recruitment_seasons.create({
            data: this.mapToPersistence(recruitmentSeason),
            include: {
                admission_types: true,
                recruitment_units: true,
            },
        });

        return this.mapToEntity(result);
    }

    /**
     * 기존 모집 시즌을 업데이트합니다.
     * 기존 전형 유형과 모집 단위를 삭제한 후 새로운 데이터로 재생성합니다.
     * @param id 업데이트할 모집 시즌의 ID
     * @param recruitmentSeason 업데이트할 모집 시즌 엔티티
     * @returns 업데이트된 모집 시즌 엔티티
     */
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
            data: this.mapToPersistenceForUpdate(recruitmentSeason),
            include: {
                admission_types: true,
                recruitment_units: true,
            },
        });

        return this.mapToEntity(result);
    }

    /**
     * 모집 시즌을 데이터베이스에서 삭제합니다.
     * CASCADE 설정으로 관련된 전형 유형과 모집 단위도 자동 삭제됩니다.
     * @param id 삭제할 모집 시즌의 ID
     */
    async delete(id: number): Promise<void> {
        await this.prisma.recruitment_seasons.delete({
            where: { id },
        });
    }

    /**
     * 특정 ID의 모집 시즌이 존재하는지 확인합니다.
     * @param id 확인할 모집 시즌의 ID
     * @returns 모집 시즌 존재 여부 (true: 존재, false: 비존재)
     */
    async exists(id: number): Promise<boolean> {
        const count = await this.prisma.recruitment_seasons.count({
            where: { id },
        });
        return count > 0;
    }

    /**
     * 도메인 엔티티를 영속성 엔티티(Prisma 데이터)로 변환합니다.
     * 비즈니스 도메인 모델에서 데이터베이스 스키마로 변환하는 매핑 로직을 처리합니다.
     * @param entity 변환할 모집 시즌 도메인 엔티티
     * @returns Prisma create 작업에 사용할 데이터 객체
     */
    private mapToPersistence(entity: RecruitmentSeason): Prisma.recruitment_seasonsCreateInput {
        return {
            universityCode: entity.universityCode,
            admissionYear: entity.admissionYear,
            admissionName: entity.admissionName,
            updatedAt: new Date(),
            admission_types: {
                create: entity.admissionTypes.map(type => ({
                    typeName: type.typeName,
                    typeCode: type.typeCode,
                })),
            },
            recruitment_units: {
                create: entity.recruitmentUnits.map(unit => ({
                    unitName: unit.unitName,
                    unitCode: unit.unitCode,
                })),
            },
        };
    }

    /**
     * 도메인 엔티티를 영속성 엔티티(Prisma 데이터)로 변환합니다 (업데이트용).
     * 업데이트 시에는 universityCode는 변경하지 않고, 관련 데이터를 재생성합니다.
     * @param entity 변환할 모집 시즌 도메인 엔티티
     * @returns Prisma update 작업에 사용할 데이터 객체
     */
    private mapToPersistenceForUpdate(entity: RecruitmentSeason): Prisma.recruitment_seasonsUpdateInput {
        return {
            admissionYear: entity.admissionYear,
            admissionName: entity.admissionName,
            updatedAt: new Date(),
            admission_types: {
                create: entity.admissionTypes.map(type => ({
                    typeName: type.typeName,
                    typeCode: type.typeCode,
                })),
            },
            recruitment_units: {
                create: entity.recruitmentUnits.map(unit => ({
                    unitName: unit.unitName,
                    unitCode: unit.unitCode,
                })),
            },
        };
    }

    /**
     * Prisma에서 조회된 데이터를 비즈니스 엔티티로 변환합니다.
     * 데이터베이스 스키마에서 비즈니스 도메인 모델로 변환하는 매핑 로직을 처리합니다.
     * @param data Prisma에서 조회된 모집 시즌 데이터 (관련 데이터 포함)
     * @returns 변환된 모집 시즌 엔티티
     */
    private mapToEntity(
        data: Prisma.recruitment_seasonsGetPayload<{
            include: {
                admission_types: true;
                recruitment_units: true;
            };
        }>,
    ): RecruitmentSeason {
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
