import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Query,
    Request,
    Res,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
    ErrorResponseDto,
    ListStudentsResponseDto,
    StudentScoreDetailResponseDto,
    SummaryResponseDto,
} from '../dto/response.dto';
import { CalculateScoresDecorator } from '../decorators/calculate-scores.decorator';
import { GetSummaryDecorator } from '../decorators/get-summary.decorator';
import { ListStudentsDecorator } from '../decorators/list-students.decorator';
import { GetStudentDetailDecorator } from '../decorators/get-student-detail.decorator';
import { ExportScoresDecorator } from '../decorators/export-scores.decorator';
import { CalculatorEnum } from '../calculator/calculator.enum';

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
        @Request() req: { user: { sub: number; email: string } },
    ): CalculateScoresResponseDto {
        const seasonId = dto.recruitmentSeasonId;
        const userId = req.user.sub;

        if (this.jobRunner.get(seasonId)) {
            return {
                success: true,
                data: { message: 'Already running' },
            };
        }

        this.jobRunner.set(seasonId, true);

        void this.scoreCalculationUseCase.calculateScores(seasonId, userId).finally(() => {
            this.jobRunner.delete(seasonId);
        });

        return {
            success: true,
            data: { message: 'Started' },
        };
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

    @ApiOperation({ summary: '지원하는 계산기 타입 목록' })
    @ApiOkResponse({ description: '계산기 타입 문자열 배열', type: [String] })
    @Get('calculators')
    listCalculators(): CalculatorEnum[] {
        return Object.values(CalculatorEnum);
    }
}
