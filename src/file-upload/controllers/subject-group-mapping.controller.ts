import {
    Controller,
    Post,
    Get,
    Query,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    UseGuards,
    ParseIntPipe,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubjectGroupMappingService } from '../services/subject-group-mapping.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SubjectGroupMappingResponseDto } from '../dto/subject-group-mapping-response.dto';
import { SubjectGroupMappingSummaryDto } from '../dto/subject-group-mapping-summary.dto';

@ApiTags('subject-group-mapping')
@Controller('subject-group-mapping')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubjectGroupMappingController {
    constructor(private readonly subjectGroupMappingService: SubjectGroupMappingService) {}

    @Post('upload')
    @ApiOperation({ summary: 'Upload subject group mapping Excel file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Excel file containing subject group mappings',
                },
                recruitmentSeasonId: {
                    type: 'number',
                    description: 'Recruitment season ID',
                    example: 1,
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Subject group mapping uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        totalRows: { type: 'number', example: 150 },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid file or missing parameters' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadExcel(
        @UploadedFile() file: Express.Multer.File,
        @Body('recruitmentSeasonId', ParseIntPipe) recruitmentSeasonId: number,
    ): Promise<{ success: boolean; data: { totalRows: number } }> {
        if (!file) {
            throw new BadRequestException('파일이 필요합니다.');
        }

        // Validate file type
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
            throw new BadRequestException('Excel 파일만 업로드 가능합니다.');
        }

        const result = await this.subjectGroupMappingService.uploadExcel(file, recruitmentSeasonId);

        return {
            success: true,
            data: result,
        };
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get subject group mapping summary' })
    @ApiQuery({
        name: 'recruitmentSeasonId',
        required: true,
        type: 'number',
        description: 'Recruitment season ID',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Subject group mapping summary retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        recruitmentSeasonId: { type: 'number', example: 1 },
                        totalRows: { type: 'number', example: 150 },
                        uploadedAt: { type: 'string', example: '2024-01-15T10:30:00Z' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getSummary(
        @Query('recruitmentSeasonId', ParseIntPipe) recruitmentSeasonId: number,
    ): Promise<{ success: boolean; data: SubjectGroupMappingSummaryDto | null }> {
        const summary = await this.subjectGroupMappingService.getSummary(recruitmentSeasonId);

        return {
            success: true,
            data: summary,
        };
    }

    @Get('details')
    @ApiOperation({ summary: 'Get subject group mapping details' })
    @ApiQuery({
        name: 'recruitmentSeasonId',
        required: true,
        type: 'number',
        description: 'Recruitment season ID',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Subject group mapping details retrieved successfully',
        type: [SubjectGroupMappingResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getDetails(
        @Query('recruitmentSeasonId', ParseIntPipe) recruitmentSeasonId: number,
    ): Promise<{ success: boolean; data: SubjectGroupMappingResponseDto[] }> {
        const mappings = await this.subjectGroupMappingService.getDetails(recruitmentSeasonId);

        return {
            success: true,
            data: mappings,
        };
    }
}
