import { Injectable, BadRequestException } from '@nestjs/common';
import { SqliteReaderService } from './services/sqlite-reader.service';
import {
    PostgresMigrationService,
    PostgresStudentBaseInfo,
    PostgresSubjectScore,
} from './services/postgres-migration.service';
import { RecruitmentCode } from './entities/recruitment-code.entity';
import { MigrationProgress, MigrationResult } from './interfaces/migration-progress.interface';
import { MigrationRequestDto } from './dto/migration-request.dto';
import { EventsService } from '../events/events.service';
import { Database } from 'sqlite3';

@Injectable()
export class DbMigrationService {
    constructor(
        private readonly sqliteReaderService: SqliteReaderService,
        private readonly postgresMigrationService: PostgresMigrationService,
        private readonly eventsService: EventsService,
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

        progressCallback({
            status: 'pending',
            percentage: 0,
            message: 'Starting migration...',
        });

        try {
            // Validate file type
            if (!request.sqliteFilePath.endsWith('.db3') && !request.sqliteFilePath.endsWith('.db')) {
                throw new BadRequestException('Only SQLite database files (.db3, .db) are allowed');
            }

            // Clear existing data
            await this.postgresMigrationService.clearExistingData(request.recruitmentSeasonId);
            progressCallback({
                status: 'processing',
                percentage: 10,
                message: 'Cleared existing data',
            });

            // Process the SQLite file
            const result = await this.processSqliteFile(
                request.sqliteFilePath,
                request.recruitmentSeasonId,
                progressCallback,
            );

            progressCallback({
                status: 'completed',
                percentage: 100,
                message: 'Migration completed successfully',
                processedRecords: result.totalStudents,
                totalRecords: result.totalStudents,
            });

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
            progressCallback({
                status: 'failed',
                percentage: 0,
                message: errorMessage,
                error: errorMessage,
            });

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
        const totalStudents = await this.postgresMigrationService.getStudentCount(recruitmentSeasonId);

        if (totalStudents === 0) {
            return null;
        }

        const totalSubjectScores = await this.postgresMigrationService.getSubjectScoreCount(recruitmentSeasonId);

        return {
            totalStudents,
            totalSubjectScores,
        };
    }

    private async processSqliteFile(
        filePath: string,
        recruitmentSeasonId: number,
        progressCallback: (progress: MigrationProgress) => void,
    ): Promise<{ totalStudents: number; totalSubjectScores: number }> {
        const db = await this.sqliteReaderService.openDatabase(filePath);
        try {
            return await this.migrateData(db, recruitmentSeasonId, progressCallback);
        } finally {
            await this.sqliteReaderService.closeDatabase(db);
        }
    }

    private async migrateData(
        db: Database,
        recruitmentSeasonId: number,
        progressCallback: (progress: MigrationProgress) => void,
    ): Promise<{ totalStudents: number; totalSubjectScores: number }> {
        // Get counts
        const studentCount = await this.sqliteReaderService.getTableCount(db, 'StudentBaseInfo');
        const subjectScoreCount = await this.sqliteReaderService.getTableCount(db, 'SubjectScore');

        progressCallback({
            status: 'processing',
            percentage: 20,
            message: 'Starting data migration...',
            processedRecords: 0,
            totalRecords: studentCount + subjectScoreCount,
        });

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
        const total = await this.sqliteReaderService.getTableCount(db, 'StudentBaseInfo');
        let processed = 0;
        let lastProgressAt = 0;
        let lastRowId = 0;

        while (true) {
            const rows = await this.sqliteReaderService.queryStudentBatch(db, lastRowId, pageSize);

            if (rows.length === 0) break;

            const studentEntities: PostgresStudentBaseInfo[] = [];
            for (const student of rows) {
                try {
                    const recruitmentCode = RecruitmentCode.fromMogib2(student.Mogib2);
                    const studentEntity: PostgresStudentBaseInfo = {
                        recruitmentSeasonId,
                        recruitmentTypeCode: recruitmentCode.typeCode,
                        recruitmentUnitCode: recruitmentCode.unitCode,
                        identifyNumber: student.IdentifyNumber,
                        socialNumber: student.SocialNumber,
                        schoolCode: student.SchoolCode,
                        collegeAdmissionYear: student.CollegeAdmissionYear,
                        seleScCode: student.SeleScCode,
                        applicantScCode: student.ApplicantScCode,
                        graduateYear: student.GraduateYear,
                        graduateGrade: student.GraduateGrade,
                        masterSchoolYN: student.MasterSchoolYN,
                        specializedSchoolYN: student.SpecializedSchoolYN,
                        correctionRegisterYN: student.CorrectionRegisterYN,
                        examNumber: student.ExamNumber,
                        uniqueFileName: student.UniqueFileName,
                        pictureFileName: student.PictureFileName,
                    };
                    studentEntities.push(studentEntity);
                } catch (error) {
                    console.warn(`Skipping invalid student record: ${error}`);
                }
            }

            if (studentEntities.length > 0) {
                const savedStudents = await this.postgresMigrationService.insertStudentBaseInfoBatch(studentEntities);
                for (const s of savedStudents) {
                    const key = `${s.recruitmentTypeCode}-${s.recruitmentUnitCode}:${s.identifyNumber}`;
                    if (s.id) {
                        studentMap.set(key, s.id);
                    }
                }
            }

            processed += rows.length;
            lastRowId = (rows[rows.length - 1].rowid as number) || lastRowId;

            const now = Date.now();
            if (now - lastProgressAt >= 1000) {
                lastProgressAt = now;
                const percentage = Math.floor((processed / total) * 50) + 20; // 20-70% for student migration
                progressCallback({
                    status: 'processing',
                    percentage,
                    message: `Migrated ${processed}/${total} student records`,
                    processedRecords: processed,
                    totalRecords: total,
                });
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
        const total = await this.sqliteReaderService.getTableCount(db, 'SubjectScore');
        let processed = 0;
        let lastProgressAt = 0;
        let lastRowId = 0;

        while (true) {
            const rows = await this.sqliteReaderService.querySubjectScoreBatch(db, lastRowId, pageSize);

            if (rows.length === 0) break;

            const scoreEntities: PostgresSubjectScore[] = [];
            for (const score of rows) {
                try {
                    const recruitmentCode = RecruitmentCode.fromMogib2(score.Mogib2);
                    const key = `${recruitmentCode.typeCode}-${recruitmentCode.unitCode}:${score.IdentifyNumber}`;
                    const studentBaseInfoId = studentMap.get(key);

                    if (studentBaseInfoId) {
                        const scoreEntity: PostgresSubjectScore = {
                            studentBaseInfoId,
                            seqNumber: score.SeqNumber,
                            socialNumber: score.SocialNumber,
                            schoolCode: score.SchoolCode,
                            year: score.Year,
                            grade: score.Grade,
                            organizationCode: score.OrganizationCode,
                            organizationName: score.OrganizationName,
                            courseCode: score.CourceCode,
                            courseName: score.CourceName,
                            subjectCode: score.SubjectCode,
                            subjectName: score.SubjectName,
                            term: score.Term,
                            unit: score.Unit,
                            assessment: score.Assessment,
                            rank: score.Rank,
                            sameRank: score.SameRank,
                            studentCount: score.StudentCount,
                            originalScore: score.OriginalScore,
                            avgScore: score.AvgScore,
                            standardDeviation: score.StandardDeviation,
                            rankingGrade: score.RankingGrade,
                            rankingGradeCode: score.RankingGradeCode,
                            achievement: score.Achievement,
                            achievementCode: score.AchievementCode,
                            achievementRatio: score.AchievementRatio,
                            subjectSeparationCode: score.SubjectSeparationCode,
                        };
                        scoreEntities.push(scoreEntity);
                    }
                } catch (error) {
                    console.warn(`Skipping invalid subject score record: ${error}`);
                }
            }

            if (scoreEntities.length > 0) {
                await this.postgresMigrationService.insertSubjectScoreBatch(scoreEntities);
            }

            processed += rows.length;
            lastRowId = (rows[rows.length - 1].rowid as number) || lastRowId;

            const now = Date.now();
            if (now - lastProgressAt >= 1000) {
                lastProgressAt = now;
                const percentage = Math.floor((processed / total) * 30) + 70; // 70-100% for subject score migration
                progressCallback({
                    status: 'processing',
                    percentage,
                    message: `Migrated ${processed}/${total} subject score records`,
                    processedRecords: processed,
                    totalRecords: total,
                });
            }
        }
    }
}
