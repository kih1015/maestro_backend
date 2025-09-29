import { Injectable } from '@nestjs/common';
import { SqliteReaderRepository } from '../repository/sqlite-reader.repository';
import {
    PostgresMigrationRepository,
    PostgresStudentBaseInfo,
    PostgresSubjectScore,
} from '../repository/postgres-migration.repository';
import { MigrationProgress, MigrationResult } from '../interfaces/migration-progress.interface';
import { MigrationRequestDto } from '../dto/migration-request.dto';
import { EventsService } from '../../events/events.service';
import { DbMigrationBusiness } from '../business/db-migration.business';
import { Database } from 'sqlite3';

@Injectable()
export class DbMigrationService {
    constructor(
        private readonly sqliteReaderRepository: SqliteReaderRepository,
        private readonly postgresMigrationRepository: PostgresMigrationRepository,
        private readonly eventsService: EventsService,
        private readonly dbMigrationBusiness: DbMigrationBusiness,
    ) {}

    async migrate(request: MigrationRequestDto): Promise<MigrationResult> {
        const progressCallback = (progress: MigrationProgress) => {
            this.eventsService.sendToUser(request.userId, 'upload.progress', {
                recruitmentSeasonId: request.recruitmentSeasonId,
                status: progress.status,
                percentage: progress.percentage,
                message: progress.message,
                current: progress.processedRecords,
                total: progress.totalRecords,
                error: progress.error,
            });
        };

        progressCallback(this.dbMigrationBusiness.createMigrationProgress('pending', 0, 'Starting migration...'));

        try {
            // Validate file type
            this.dbMigrationBusiness.validateSqliteFile(request.sqliteFilePath);

            // Clear existing data
            await this.postgresMigrationRepository.clearExistingData(request.recruitmentSeasonId);
            progressCallback(
                this.dbMigrationBusiness.createMigrationProgress('processing', 10, 'Cleared existing data'),
            );

            // Process the SQLite file directly
            const db = await this.sqliteReaderRepository.openDatabase(request.sqliteFilePath);
            let result: { totalStudents: number; totalSubjectScores: number };
            try {
                result = await this.migrateData(db, request.recruitmentSeasonId, progressCallback);
            } finally {
                await this.sqliteReaderRepository.closeDatabase(db);
            }

            progressCallback(
                this.dbMigrationBusiness.createMigrationProgress(
                    'completed',
                    100,
                    'Migration completed successfully',
                    result.totalStudents,
                    result.totalStudents,
                ),
            );

            // Send completion event
            this.eventsService.sendToUser(request.userId, 'upload.done', {
                recruitmentSeasonId: request.recruitmentSeasonId,
                completed: result.totalStudents,
                total: result.totalStudents,
                message: 'Database migration completed successfully',
            });

            return {
                ...result,
                completedAt: new Date(),
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            progressCallback(
                this.dbMigrationBusiness.createMigrationProgress(
                    'failed',
                    0,
                    errorMessage,
                    undefined,
                    undefined,
                    errorMessage,
                ),
            );

            // Send error event
            this.eventsService.sendToUser(request.userId, 'upload.error', {
                recruitmentSeasonId: request.recruitmentSeasonId,
                message: errorMessage,
                error: errorMessage,
            });

            throw error;
        }
    }

    async getMigrationSummary(
        recruitmentSeasonId: number,
    ): Promise<{ totalStudents: number; totalSubjectScores: number } | null> {
        const totalStudents = await this.postgresMigrationRepository.getStudentCount(recruitmentSeasonId);

        if (totalStudents === 0) {
            return null;
        }

        const totalSubjectScores = await this.postgresMigrationRepository.getSubjectScoreCount(recruitmentSeasonId);

        return {
            totalStudents,
            totalSubjectScores,
        };
    }

    private async migrateData(
        db: Database,
        recruitmentSeasonId: number,
        progressCallback: (progress: MigrationProgress) => void,
    ): Promise<{ totalStudents: number; totalSubjectScores: number }> {
        // Get counts
        const studentCount = await this.sqliteReaderRepository.getTableCount(db, 'StudentBaseInfo');
        const subjectScoreCount = await this.sqliteReaderRepository.getTableCount(db, 'SubjectScore');

        progressCallback(
            this.dbMigrationBusiness.createMigrationProgress(
                'processing',
                20,
                'Starting data migration...',
                0,
                studentCount + subjectScoreCount,
            ),
        );

        // Migrate students
        const studentMap = await this.migrateStudentBaseInfo(db, recruitmentSeasonId, progressCallback);

        // Migrate subject scores
        await this.migrateSubjectScores(db, studentMap, progressCallback);

        return {
            totalStudents: studentMap.size,
            totalSubjectScores: subjectScoreCount,
        };
    }

    private async migrateStudentBaseInfo(
        db: Database,
        recruitmentSeasonId: number,
        progressCallback: (progress: MigrationProgress) => void,
    ): Promise<Map<string, number>> {
        const studentMap = new Map<string, number>();
        const pageSize = 1000;
        const total = await this.sqliteReaderRepository.getTableCount(db, 'StudentBaseInfo');
        let processed = 0;
        let lastProgressAt = 0;
        let lastRowId = 0;

        while (true) {
            const rows = await this.sqliteReaderRepository.queryStudentBatch(db, lastRowId, pageSize);

            if (rows.length === 0) break;

            const studentEntities: PostgresStudentBaseInfo[] = [];
            for (const student of rows) {
                const studentEntity = this.dbMigrationBusiness.transformStudentBaseInfo(student, recruitmentSeasonId);
                if (studentEntity) {
                    studentEntities.push(studentEntity);
                }
            }

            if (studentEntities.length > 0) {
                const savedStudents =
                    await this.postgresMigrationRepository.insertStudentBaseInfoBatch(studentEntities);
                for (const s of savedStudents) {
                    const key = this.dbMigrationBusiness.createStudentMapKey(
                        s.recruitmentTypeCode,
                        s.recruitmentUnitCode,
                        s.identifyNumber,
                    );
                    if (s.id) {
                        studentMap.set(key, s.id);
                    }
                }
            }

            processed += rows.length;
            lastRowId = (rows[rows.length - 1].rowid as number) || lastRowId;

            const now = Date.now();
            if (this.dbMigrationBusiness.shouldUpdateProgress(lastProgressAt)) {
                lastProgressAt = now;
                const percentage = this.dbMigrationBusiness.calculateProgressPercentage(processed, total, 20, 50);
                progressCallback(
                    this.dbMigrationBusiness.createMigrationProgress(
                        'processing',
                        percentage,
                        `Migrated ${processed}/${total} student records`,
                        processed,
                        total,
                    ),
                );
            }
        }

        return studentMap;
    }

    private async migrateSubjectScores(
        db: Database,
        studentMap: Map<string, number>,
        progressCallback: (progress: MigrationProgress) => void,
    ): Promise<void> {
        const pageSize = 1000;
        const total = await this.sqliteReaderRepository.getTableCount(db, 'SubjectScore');
        let processed = 0;
        let lastProgressAt = 0;
        let lastRowId = 0;

        while (true) {
            const rows = await this.sqliteReaderRepository.querySubjectScoreBatch(db, lastRowId, pageSize);

            if (rows.length === 0) break;

            const scoreEntities: PostgresSubjectScore[] = [];
            for (const score of rows) {
                const scoreEntity = this.dbMigrationBusiness.transformSubjectScore(score, studentMap);
                if (scoreEntity) {
                    scoreEntities.push(scoreEntity);
                }
            }

            if (scoreEntities.length > 0) {
                await this.postgresMigrationRepository.insertSubjectScoreBatch(scoreEntities);
            }

            processed += rows.length;
            lastRowId = (rows[rows.length - 1].rowid as number) || lastRowId;

            const now = Date.now();
            if (this.dbMigrationBusiness.shouldUpdateProgress(lastProgressAt)) {
                lastProgressAt = now;
                const percentage = this.dbMigrationBusiness.calculateProgressPercentage(processed, total, 70, 30);
                progressCallback(
                    this.dbMigrationBusiness.createMigrationProgress(
                        'processing',
                        percentage,
                        `Migrated ${processed}/${total} subject score records`,
                        processed,
                        total,
                    ),
                );
            }
        }
    }
}
