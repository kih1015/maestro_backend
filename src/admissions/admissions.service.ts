import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AdmissionsRepository } from './admissions.repository';
import { RecruitmentSeason, AdmissionType, RecruitmentUnit } from './entities/recruitment-season.entity';
import {
    CreateRecruitmentSeasonData,
    UpdateRecruitmentSeasonData,
    RecruitmentSeasonServiceInterface,
} from './interfaces/recruitment-season.service.interface';

/**
 * 입학 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 모집 시즌의 생성, 조회, 수정, 삭제와 관련된 비즈니스 규칙을 구현합니다.
 * 전형 유형과 모집 단위의 중복성 검증 등의 비즈니스 로직을 포함합니다.
 */
@Injectable()
export class AdmissionsService implements RecruitmentSeasonServiceInterface {
    constructor(private admissionsRepository: AdmissionsRepository) {}

    /**
     * 새로운 모집 시즌을 생성합니다.
     * 전형 유형과 모집 단위의 중복성을 검증한 후 데이터베이스에 저장합니다.
     * @param data 모집 시즌 생성에 필요한 데이터
     * @returns 생성된 모집 시즌 엔티티
     * @throws ConflictException 전형 유형 또는 모집 단위의 코드나 이름이 중복될 경우
     */
    async createRecruitmentSeason(data: CreateRecruitmentSeasonData): Promise<RecruitmentSeason> {
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

    /**
     * 모집 시즌 목록을 조회합니다.
     * 대학 코드가 제공되면 해당 대학의 모집 시즌만 조회하고, 그렇지 않으면 전체 모집 시즌을 조회합니다.
     * @param universityCode 선택적 매개변수로, 특정 대학의 모집 시즌만 조회할 때 사용
     * @returns 조회된 모집 시즌 목록
     */
    async getAllRecruitmentSeasons(universityCode?: string): Promise<RecruitmentSeason[]> {
        if (universityCode) {
            return await this.admissionsRepository.findByUniversityCode(universityCode);
        } else {
            return await this.admissionsRepository.findAll();
        }
    }

    /**
     * ID로 특정 모집 시즌을 조회합니다.
     * @param id 조회할 모집 시즌의 고유 식별자
     * @returns 조회된 모집 시즌 엔티티
     * @throws NotFoundException 해당 ID의 모집 시즌을 찾을 수 없을 경우
     */
    async getRecruitmentSeasonById(id: number): Promise<RecruitmentSeason> {
        const season = await this.admissionsRepository.findById(id);
        if (!season) {
            throw new NotFoundException('Recruitment season not found');
        }
        return season;
    }

    /**
     * 기존 모집 시즌 정보를 업데이트합니다.
     * 전형 유형과 모집 단위의 중복성을 검증한 후 데이터베이스를 업데이트합니다.
     * @param id 수정할 모집 시즌의 고유 식별자
     * @param data 업데이트할 모집 시즌 데이터
     * @returns 수정된 모집 시즌 엔티티
     * @throws NotFoundException 해당 ID의 모집 시즌을 찾을 수 없을 경우
     * @throws ConflictException 전형 유형 또는 모집 단위의 코드나 이름이 중복될 경우
     */
    async updateRecruitmentSeason(id: number, data: UpdateRecruitmentSeasonData): Promise<RecruitmentSeason> {
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

    /**
     * 특정 모집 시즌을 삭제합니다.
     * 먼저 해당 모집 시즌이 존재하는지 확인한 후 삭제 작업을 수행합니다.
     * @param id 삭제할 모집 시즌의 고유 식별자
     * @throws NotFoundException 해당 ID의 모집 시즌을 찾을 수 없을 경우
     */
    async deleteRecruitmentSeason(id: number): Promise<void> {
        const exists = await this.admissionsRepository.exists(id);
        if (!exists) {
            throw new NotFoundException('Recruitment season not found');
        }

        await this.admissionsRepository.delete(id);
    }
}
