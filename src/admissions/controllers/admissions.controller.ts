import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    ValidationPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import { CreateRecruitmentSeasonService } from '../use-cases/create-recruitment-season.service';
import { GetRecruitmentSeasonsService } from '../use-cases/get-recruitment-seasons.service';
import { UpdateRecruitmentSeasonService } from '../use-cases/update-recruitment-season.service';
import { DeleteRecruitmentSeasonService } from '../use-cases/delete-recruitment-season.service';
import { CreateRecruitmentSeasonDto } from '../dto/create-recruitment-season.dto';
import { UpdateRecruitmentSeasonDto } from '../dto/update-recruitment-season.dto';
import { RecruitmentSeasonResponseDto } from '../dto/recruitment-season-response.dto';
import { AdmissionTypeDto } from '../dto/admission-type.dto';
import { RecruitmentUnitDto } from '../dto/recruitment-unit.dto';
import { CalculatorEnum } from '../../score-calculation/calculator/calculator.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RecruitmentSeason } from '../entities/recruitment-season.entity';
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
    constructor(
        private readonly createRecruitmentSeasonService: CreateRecruitmentSeasonService,
        private readonly getRecruitmentSeasonsService: GetRecruitmentSeasonsService,
        private readonly updateRecruitmentSeasonService: UpdateRecruitmentSeasonService,
        private readonly deleteRecruitmentSeasonService: DeleteRecruitmentSeasonService,
    ) {}

    /**
     * 새로운 모집 시즌을 생성합니다.
     * 대학 코드, 입학 연도, 전형 유형, 모집 단위 정보를 포함하여 모집 시즌을 생성합니다.
     * @param createDto 모집 시즌 생성에 필요한 정보를 담은 DTO
     * @param req
     * @returns 생성된 모집 시즌 정보와 성공 메시지
     * @throws ConflictException 전형 유형 또는 모집 단위의 코드나 이름이 중복될 경우
     * @throws ValidationException 입력 데이터 검증에 실패할 경우
     */
    @Post('seasons')
    @CreateRecruitmentSeasonSwagger
    async createRecruitmentSeason(
        @Body(ValidationPipe) createDto: CreateRecruitmentSeasonDto,
        @Request() req: { user: { sub: number } },
    ): Promise<{ success: boolean; data: RecruitmentSeasonResponseDto; message: string }> {
        const season = await this.createRecruitmentSeasonService.execute({
            universityCode: createDto.universityCode,
            admissionYear: createDto.admissionPeriod.admissionYear,
            admissionName: createDto.admissionPeriod.admissionName,
            calculatorType: createDto.calculatorType,
            userId: req.user.sub,
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
     * 사용자가 생성한 모집 시즌 목록을 조회합니다.
     * JWT 토큰에서 사용자 ID를 추출하여 해당 사용자가 생성한 모집 시즌을 조회합니다.
     * @param req 사용자 정보가 포함된 Request 객체
     * @returns 사용자의 모집 시즌 목록과 성공 상태
     */
    @Get('seasons')
    @GetRecruitmentSeasonsSwagger
    async getRecruitmentSeasons(
        @Request() req: { user: { sub: number } },
    ): Promise<{ success: boolean; data: RecruitmentSeasonResponseDto[] }> {
        const seasons = await this.getRecruitmentSeasonsService.getRecruitmentSeasonsByUserId(req.user.sub);
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
        const season = await this.getRecruitmentSeasonsService.getRecruitmentSeasonById(id);
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
        const updateData: Partial<{
            admissionYear: number;
            admissionName: string;
            calculatorType: CalculatorEnum;
            admissionTypes: AdmissionTypeDto[];
            recruitmentUnits: RecruitmentUnitDto[];
        }> = {};

        if (updateDto.admissionPeriod) {
            updateData.admissionYear = updateDto.admissionPeriod.admissionYear;
            updateData.admissionName = updateDto.admissionPeriod.admissionName;
        }

        if (updateDto.calculatorType !== undefined) {
            updateData.calculatorType = updateDto.calculatorType;
        }

        if (updateDto.admissionTypes !== undefined) {
            updateData.admissionTypes = updateDto.admissionTypes;
        }

        if (updateDto.recruitmentUnits !== undefined) {
            updateData.recruitmentUnits = updateDto.recruitmentUnits;
        }

        const season = await this.updateRecruitmentSeasonService.execute(id, updateData);

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
        await this.deleteRecruitmentSeasonService.execute(id);
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
            calculatorType: season.calculatorType,
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
