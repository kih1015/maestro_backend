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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdmissionsService } from './admissions.service';
import { CreateRecruitmentSeasonDto } from './dto/create-recruitment-season.dto';
import { UpdateRecruitmentSeasonDto } from './dto/update-recruitment-season.dto';
import { RecruitmentSeasonResponseDto } from './dto/recruitment-season-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecruitmentSeason } from './entities/recruitment-season.entity';

@ApiTags('admissions')
@Controller('admissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdmissionsController {
    constructor(private readonly admissionsService: AdmissionsService) {}

    @Post('seasons')
    @ApiOperation({ summary: 'Create recruitment season' })
    @ApiResponse({
        status: 201,
        description: 'Recruitment season created successfully',
        type: RecruitmentSeasonResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 409, description: 'Conflict - duplicate codes or names' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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

    @Get('seasons')
    @ApiOperation({ summary: 'Get recruitment seasons' })
    @ApiQuery({
        name: 'universityCode',
        required: false,
        description: 'Filter by university code',
        example: 'GACHON',
    })
    @ApiResponse({
        status: 200,
        description: 'Recruitment seasons retrieved successfully',
        type: [RecruitmentSeasonResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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

    @Get('seasons/:id')
    @ApiOperation({ summary: 'Get recruitment season by ID' })
    @ApiParam({ name: 'id', description: 'Recruitment season ID', example: 1 })
    @ApiResponse({
        status: 200,
        description: 'Recruitment season retrieved successfully',
        type: RecruitmentSeasonResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Recruitment season not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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

    @Put('seasons/:id')
    @ApiOperation({ summary: 'Update recruitment season' })
    @ApiParam({ name: 'id', description: 'Recruitment season ID', example: 1 })
    @ApiResponse({
        status: 200,
        description: 'Recruitment season updated successfully',
        type: RecruitmentSeasonResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Recruitment season not found' })
    @ApiResponse({ status: 409, description: 'Conflict - duplicate codes or names' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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

    @Delete('seasons/:id')
    @ApiOperation({ summary: 'Delete recruitment season' })
    @ApiParam({ name: 'id', description: 'Recruitment season ID', example: 1 })
    @ApiResponse({
        status: 200,
        description: 'Recruitment season deleted successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Recruitment season not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async deleteRecruitmentSeason(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ success: boolean; message: string }> {
        await this.admissionsService.deleteRecruitmentSeason(id);
        return {
            success: true,
            message: 'Recruitment season deleted successfully',
        };
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
