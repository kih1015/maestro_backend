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
    Req,
    Sse,
    MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventsService } from '../events/events.service';
import { FileUploadSummaryDto } from './dto/file-upload-summary.dto';
import { UploadFileRequestDto } from './dto/upload-file-request.dto';

interface AuthenticatedRequest extends Request {
    user: { sub: number; email: string };
}

@ApiTags('file-upload')
@Controller('file-upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileUploadController {
    constructor(
        private readonly fileUploadService: FileUploadService,
        private readonly eventsService: EventsService,
    ) {}

    @Post('upload')
    @ApiOperation({ summary: 'Upload SQLite database file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'SQLite database file (.db3 or .db)',
                },
                recruitmentSeasonId: {
                    type: 'number',
                    description: 'Recruitment season ID',
                    example: 1,
                },
                fileName: {
                    type: 'string',
                    description: 'Original file name',
                    example: 'student_data.db3',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'File upload started successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string', example: 'upload_1_1234567890' },
                        message: { type: 'string', example: 'File upload started successfully' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid file type or missing parameters' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('recruitmentSeasonId', ParseIntPipe) recruitmentSeasonId: number,
        @Query('fileName') fileName: string,
        @Req() req: AuthenticatedRequest,
    ): Promise<{ success: boolean; data: FileUploadSummaryDto }> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const userId = req.user.sub;
        const request = new UploadFileRequestDto();
        Object.assign(request, {
            recruitmentSeasonId,
            fileName: fileName || file.originalname,
            fileSize: file.size,
        });

        const result = await this.fileUploadService.uploadAndMigrate(request, file, userId);

        return {
            success: true,
            data: result,
        };
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get upload summary for recruitment season' })
    @ApiQuery({
        name: 'recruitmentSeasonId',
        required: true,
        type: 'number',
        description: 'Recruitment season ID',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Upload summary retrieved successfully',
        type: FileUploadSummaryDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'No upload data found for the specified season' })
    async getUploadSummary(
        @Query('recruitmentSeasonId', ParseIntPipe) recruitmentSeasonId: number,
    ): Promise<{ success: boolean; data: FileUploadSummaryDto }> {
        const summary = await this.fileUploadService.getUploadSummary(recruitmentSeasonId);

        if (!summary) {
            // Return default values for consistency with frontend expectation
            const defaultSummary = new FileUploadSummaryDto({
                recruitmentSeasonId,
                totalStudents: 0,
                totalSubjectScores: 0,
                uploadedAt: new Date().toISOString(),
            });

            return {
                success: true,
                data: defaultSummary,
            };
        }

        return {
            success: true,
            data: summary,
        };
    }

    @Sse('progress')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get upload progress via SSE' })
    @ApiResponse({
        status: 200,
        description: 'SSE connection for upload progress',
        headers: {
            'Content-Type': { description: 'text/event-stream' },
            'Cache-Control': { description: 'no-cache' },
            Connection: { description: 'keep-alive' },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getUploadProgress(@Req() req: AuthenticatedRequest): Observable<MessageEvent> {
        const userId = req.user.sub;
        return this.eventsService.subscribeToUser(userId);
    }
}
