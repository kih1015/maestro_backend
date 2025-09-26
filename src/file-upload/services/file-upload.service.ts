import { Injectable, BadRequestException } from '@nestjs/common';
import { TempFileStorageService } from './temp-file-storage.service';
import { EventsService } from '../../events/events.service';
import { DbMigrationService } from '../../db-migration/services/db-migration.service';
import { MigrationRequestDto } from '../../db-migration/dto/migration-request.dto';
import { FileUploadSummaryDto } from '../dto/file-upload-summary.dto';
import { UploadFileRequestDto } from '../dto/upload-file-request.dto';

@Injectable()
export class FileUploadService {
    private readonly jobRunner = new Map<string, boolean>();

    constructor(
        private readonly tempFileStorageService: TempFileStorageService,
        private readonly eventsService: EventsService,
        private readonly dbMigrationService: DbMigrationService,
    ) {}

    startUploadAndMigrate(request: UploadFileRequestDto, file: Express.Multer.File, userId: number): string {
        const sessionId = `upload_${request.recruitmentSeasonId}_${Date.now()}`;

        // Check if upload is already running for this season
        const existingSessionKey = Array.from(this.jobRunner.keys()).find(key =>
            key.includes(`_${request.recruitmentSeasonId}_`),
        );

        if (existingSessionKey) {
            return existingSessionKey;
        }

        // Set job as running
        this.jobRunner.set(sessionId, true);

        // Start upload and migration in background
        void this.uploadAndMigrate(request, file, userId).finally(() => {
            // Clear job status when done
            this.jobRunner.delete(sessionId);
        });

        return sessionId;
    }

    async uploadAndMigrate(
        request: UploadFileRequestDto,
        file: Express.Multer.File,
        userId: number,
    ): Promise<FileUploadSummaryDto> {
        // Send start event
        this.eventsService.sendToUser(userId, 'upload.start', {
            recruitmentSeasonId: request.recruitmentSeasonId,
            message: 'File upload started',
        });

        try {
            // Validate file type
            if (!file.originalname.endsWith('.db3') && !file.originalname.endsWith('.db')) {
                throw new BadRequestException('Only SQLite database files (.db3, .db) are allowed');
            }

            // Save temporary file
            const { path: tempFilePath } = await this.tempFileStorageService.saveFile(file, request.fileName);

            // Start migration
            const migrationRequest = new MigrationRequestDto();
            Object.assign(migrationRequest, {
                recruitmentSeasonId: request.recruitmentSeasonId,
                sqliteFilePath: tempFilePath,
                userId,
            });

            const result = await this.dbMigrationService.migrate(migrationRequest);

            // Clean up temporary file after successful migration
            await this.tempFileStorageService.remove(tempFilePath);

            // Send completion event
            this.eventsService.sendToUser(userId, 'upload.done', {
                recruitmentSeasonId: request.recruitmentSeasonId,
                completed: result.totalStudents,
                total: result.totalStudents,
                message: 'File upload and migration completed successfully',
            });

            return new FileUploadSummaryDto({
                recruitmentSeasonId: request.recruitmentSeasonId,
                totalStudents: result.totalStudents,
                totalSubjectScores: result.totalSubjectScores,
                uploadedAt: result.completedAt.toISOString(),
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            // Send error event
            this.eventsService.sendToUser(userId, 'upload.error', {
                recruitmentSeasonId: request.recruitmentSeasonId,
                message: errorMessage,
                error: errorMessage,
            });

            throw error;
        }
    }

    async getUploadSummary(recruitmentSeasonId: number): Promise<FileUploadSummaryDto | null> {
        const summary = await this.dbMigrationService.getMigrationSummary(recruitmentSeasonId);

        if (!summary) {
            return null;
        }

        return new FileUploadSummaryDto({
            recruitmentSeasonId,
            totalStudents: summary.totalStudents,
            totalSubjectScores: summary.totalSubjectScores,
            uploadedAt: new Date().toISOString(),
        });
    }
}
