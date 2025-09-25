import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    ValidationPipe,
    UseGuards,
} from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { CreateRecruitmentSeasonDto } from './dto/create-recruitment-season.dto';
import { UpdateRecruitmentSeasonDto } from './dto/update-recruitment-season.dto';
import { RecruitmentSeasonResponseDto } from './dto/recruitment-season-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecruitmentSeason } from './entities/recruitment-season.entity';
import {
    AdmissionsControllerSwagger,
    CreateRecruitmentSeasonSwagger,
    GetRecruitmentSeasonsSwagger,
    GetRecruitmentSeasonByIdSwagger,
    UpdateRecruitmentSeasonSwagger,
    DeleteRecruitmentSeasonSwagger,
} from './admissions.swagger';

/**
 * 입학 관련 API를 처리하는 컨트롤러 클래스
 * 모집 시즌, 전형 유형, 모집 단위 등을 관리합니다.
 */
@Controller('admissions')
@UseGuards(JwtAuthGuard)
@AdmissionsControllerSwagger
export class AdmissionsController {
    constructor(private readonly admissionsService: AdmissionsService) {}

    /**
     * 새로운 모집 시즌을 생성합니다.
     * 대학 코드, 입학 연도, 전형 유형, 모집 단위 정보를 포함하여 모집 시즌을 생성합니다.
     * @param createDto 모집 시즌 생성에 필요한 정보를 담은 DTO
     * @returns 생성된 모집 시즌 정보와 성공 메시지
     * @throws ConflictException 전형 유형 또는 모집 단위의 코드나 이름이 중복될 경우
     * @throws ValidationException 입력 데이터 검증에 실패할 경우
     */
    @Post('seasons')
    @CreateRecruitmentSeasonSwagger
    async createRecruitmentSeason(
        @Body(ValidationPipe) createDto: CreateRecruitmentSeasonDto,
    ): Promise<{ success: boolean; data: RecruitmentSeasonResponseDto; message: string }> {
        const season = await this.admissionsService.createRecruitmentSeason({
            universityCode: createDto.universityCode,
            admissionYear: createDto.admissionPeriod.admissionYear,
            admissionName: createDto.admissionPeriod.admissionName,
            admissionTypes: createDto.admissionTypes,
            recruitmentUnits: createDto.recruitmentUnits,
        });

        const data = this.mapToResponseDto(season);
        return {
            success: true,
            data,
            message: 'Recruitment season created successfully',
        };
    }

    /**
     * 모집 시즌 목록을 조회합니다.
     * 특정 대학 코드로 필터링하거나 전체 모집 시즌을 조회할 수 있습니다.
     * @param universityCode 선택적 매개변수로, 특정 대학의 모집 시즌만 조회할 때 사용
     * @returns 모집 시즌 목록과 성공 상태
     */
    @Get('seasons')
    @GetRecruitmentSeasonsSwagger
    async getRecruitmentSeasons(
        @Query('universityCode') universityCode?: string,
    ): Promise<{ success: boolean; data: RecruitmentSeasonResponseDto[] }> {
        const seasons = await this.admissionsService.getAllRecruitmentSeasons(universityCode);
        const data = seasons.map(season => this.mapToResponseDto(season));
        return {
            success: true,
            data,
        };
    }

    /**
     * ID로 특정 모집 시즌을 조회합니다.
     * @param id 조회할 모집 시즌의 고유 식별자
     * @returns 조회된 모집 시즌 정보와 성공 상태
     * @throws NotFoundException 해당 ID의 모집 시즌을 찾을 수 없을 경우
     */
    @Get('seasons/:id')
    @GetRecruitmentSeasonByIdSwagger
    async getRecruitmentSeasonById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ success: boolean; data: RecruitmentSeasonResponseDto }> {
        const season = await this.admissionsService.getRecruitmentSeasonById(id);
        const data = this.mapToResponseDto(season);
        return {
            success: true,
            data,
        };
    }

    /**
     * 기존 모집 시즌 정보를 수정합니다.
     * 입학 연도, 전형 유형, 모집 단위 등의 정보를 업데이트할 수 있습니다.
     * @param id 수정할 모집 시즌의 고유 식별자
     * @param updateDto 수정할 정보를 담은 DTO
     * @returns 수정된 모집 시즌 정보와 성공 메시지
     * @throws NotFoundException 해당 ID의 모집 시즌을 찾을 수 없을 경우
     * @throws ConflictException 전형 유형 또는 모집 단위의 코드나 이름이 중복될 경우
     * @throws ValidationException 입력 데이터 검증에 실패할 경우
     */
    @Put('seasons/:id')
    @UpdateRecruitmentSeasonSwagger
    async updateRecruitmentSeason(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateDto: UpdateRecruitmentSeasonDto,
    ): Promise<{ success: boolean; data: RecruitmentSeasonResponseDto; message: string }> {
        const season = await this.admissionsService.updateRecruitmentSeason(id, {
            admissionYear: updateDto.admissionPeriod.admissionYear,
            admissionName: updateDto.admissionPeriod.admissionName,
            admissionTypes: updateDto.admissionTypes,
            recruitmentUnits: updateDto.recruitmentUnits,
        });

        const data = this.mapToResponseDto(season);
        return {
            success: true,
            data,
            message: 'Recruitment season updated successfully',
        };
    }

    /**
     * 특정 모집 시즌을 삭제합니다.
     * 해당 모집 시즌과 관련된 모든 데이터(전형 유형, 모집 단위)도 함께 삭제됩니다.
     * @param id 삭제할 모집 시즌의 고유 식별자
     * @returns 삭제 성공 메시지
     * @throws NotFoundException 해당 ID의 모집 시즌을 찾을 수 없을 경우
     */
    @Delete('seasons/:id')
    @DeleteRecruitmentSeasonSwagger
    async deleteRecruitmentSeason(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ success: boolean; message: string }> {
        await this.admissionsService.deleteRecruitmentSeason(id);
        return {
            success: true,
            message: 'Recruitment season deleted successfully',
        };
    }

    /**
     * RecruitmentSeason 엔티티를 클라이언트 응답용 DTO로 변환합니다.
     * @param season 변환할 모집 시즌 엔티티
     * @returns 클라이언트 응답용으로 변환된 DTO 객체
     */
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
