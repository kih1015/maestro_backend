import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    ValidationPipe,
    UseGuards,
    HttpException,
    HttpStatus,
    Res,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiProduces } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScoreCalculationUseCase } from './use-cases/score-calculation.use-case';
import { StudentQueryUseCase } from './use-cases/student-query.use-case';
import { ScoreExportUseCase } from './use-cases/score-export.use-case';
import { SummaryUseCase } from './use-cases/summary.use-case';
import { CalculateScoresDto } from './dto/calculate-scores.dto';
import { ListStudentsDto } from './dto/list-students.dto';
import { GetStudentDetailDto } from './dto/student-detail.dto';
import { GetSummaryDto } from './dto/summary.dto';
import { ExportScoresDto } from './dto/export.dto';
import {
    CalculateScoresResponseDto,
    SummaryResponseDto,
    ListStudentsResponseDto,
    StudentScoreDetailResponseDto,
    ErrorResponseDto,
} from './dto/response.dto';

@ApiTags('score-calculation')
@Controller('score-calculation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScoreCalculationController {
    private readonly jobRunner = new Map<number, boolean>(); // Simple job runner for demo

    constructor(
        private readonly scoreCalculationUseCase: ScoreCalculationUseCase,
        private readonly studentQueryUseCase: StudentQueryUseCase,
        private readonly scoreExportUseCase: ScoreExportUseCase,
        private readonly summaryUseCase: SummaryUseCase,
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Calculate scores',
        description: 'Start score calculation process for a recruitment season',
    })
    @ApiResponse({
        status: 200,
        description: 'Score calculation started or already running',
        type: CalculateScoresResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
        type: ErrorResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    calculateScores(
        @Body(ValidationPipe) dto: CalculateScoresDto,
        @Request() req: { user?: { sub: number; email: string } },
    ): CalculateScoresResponseDto {
        const seasonId = dto.recruitmentSeasonId;
        const userId = req.user?.sub; // JWT payload에서 사용자 ID 추출

        // Check if calculation is already running
        if (this.jobRunner.get(seasonId)) {
            return {
                success: true,
                data: { message: 'Already running' },
            };
        }

        try {
            // Set job as running
            this.jobRunner.set(seasonId, true);

            // Start calculation in background with user ID for SSE events
            void this.scoreCalculationUseCase
                .calculateScores({ recruitmentSeasonId: seasonId }, { userId })
                .finally(() => {
                    // Clear job status when done
                    this.jobRunner.delete(seasonId);
                });

            return {
                success: true,
                data: { message: 'Started' },
            };
        } catch (error) {
            this.jobRunner.delete(seasonId);
            throw error;
        }
    }

    @Get('summary')
    @ApiOperation({
        summary: 'Get calculation summary',
        description: 'Get summary statistics for score calculation in a recruitment season',
    })
    @ApiQuery({
        name: 'recruitmentSeasonId',
        description: 'Recruitment season ID (required)',
        example: 1,
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'Summary retrieved successfully',
        type: SummaryResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
        type: ErrorResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async getSummary(@Query(ValidationPipe) dto: GetSummaryDto): Promise<SummaryResponseDto> {
        return this.summaryUseCase.getSummary(dto);
    }

    @Get('student')
    @ApiOperation({
        summary: 'List students with scores',
        description: 'Get a paginated list of students with their calculated scores',
    })
    @ApiQuery({
        name: 'recruitmentSeasonId',
        description: 'Recruitment season ID (required)',
        example: 1,
        type: Number,
    })
    @ApiQuery({
        name: 'page',
        description: 'Page number for pagination',
        example: 1,
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'pageSize',
        description: 'Number of items per page (max 100)',
        example: 10,
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'q',
        description: 'Search query for student identification number or exam number',
        example: '20240001',
        required: false,
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: 'Students with scores retrieved successfully',
        type: ListStudentsResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
        type: ErrorResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async listStudents(@Query(ValidationPipe) dto: ListStudentsDto): Promise<ListStudentsResponseDto> {
        return this.studentQueryUseCase.listStudents(dto);
    }

    @Get('student/detail')
    @ApiOperation({
        summary: 'Get student score detail',
        description: 'Get detailed score calculation information for a specific student',
    })
    @ApiQuery({
        name: 'recruitmentSeasonId',
        description: 'Recruitment season ID (required)',
        example: 1,
        type: Number,
    })
    @ApiQuery({
        name: 'identifyNumber',
        description: 'Student identification number (required)',
        example: '20240001',
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: 'Student score detail retrieved successfully',
        type: StudentScoreDetailResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Student not found',
        type: ErrorResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async getStudentDetail(
        @Query(ValidationPipe) dto: GetStudentDetailDto,
    ): Promise<StudentScoreDetailResponseDto | ErrorResponseDto> {
        const result = await this.studentQueryUseCase.getStudentDetail(dto);

        if (!result.success) {
            throw new HttpException(result.error || 'Student not found', HttpStatus.NOT_FOUND);
        }

        return result as StudentScoreDetailResponseDto;
    }

    @Get('export')
    @ApiOperation({
        summary: 'Export scores to Excel',
        description: 'Export calculated scores for a recruitment season to Excel file',
    })
    @ApiQuery({
        name: 'recruitmentSeasonId',
        description: 'Recruitment season ID (required)',
        example: 1,
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'Excel file with score results',
        content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
        type: ErrorResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    async exportScores(@Query(ValidationPipe) dto: ExportScoresDto, @Res() res: Response): Promise<void> {
        const xlsxBuffer = await this.scoreExportUseCase.exportScores(dto);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="score_results_${dto.recruitmentSeasonId}.xlsx"`,
            'Cache-Control': 'no-store',
        });

        res.send(xlsxBuffer);
    }
}
