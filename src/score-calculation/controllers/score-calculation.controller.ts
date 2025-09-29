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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ScoreCalculationUseCase } from '../services/score-calculation.use-case';
import { StudentQueryUseCase } from '../services/student-query.use-case';
import { ScoreExportUseCase } from '../services/score-export.use-case';
import { SummaryUseCase } from '../services/summary.use-case';
import { CalculateScoresDto } from '../dto/calculate-scores.dto';
import { ListStudentsDto } from '../dto/list-students.dto';
import { GetStudentDetailDto } from '../dto/student-detail.dto';
import { GetSummaryDto } from '../dto/summary.dto';
import { ExportScoresDto } from '../dto/export.dto';
import {
    CalculateScoresResponseDto,
    SummaryResponseDto,
    ListStudentsResponseDto,
    StudentScoreDetailResponseDto,
    ErrorResponseDto,
} from '../dto/response.dto';
import { CalculateScoresDecorator } from '../decorators/calculate-scores.decorator';
import { GetSummaryDecorator } from '../decorators/get-summary.decorator';
import { ListStudentsDecorator } from '../decorators/list-students.decorator';
import { GetStudentDetailDecorator } from '../decorators/get-student-detail.decorator';
import { ExportScoresDecorator } from '../decorators/export-scores.decorator';

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
    @CalculateScoresDecorator()
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
    @GetSummaryDecorator()
    async getSummary(@Query(ValidationPipe) dto: GetSummaryDto): Promise<SummaryResponseDto> {
        return this.summaryUseCase.getSummary(dto);
    }

    @Get('student')
    @ListStudentsDecorator()
    async listStudents(@Query(ValidationPipe) dto: ListStudentsDto): Promise<ListStudentsResponseDto> {
        return this.studentQueryUseCase.listStudents(dto);
    }

    @Get('student/detail')
    @GetStudentDetailDecorator()
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
    @ExportScoresDecorator()
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
