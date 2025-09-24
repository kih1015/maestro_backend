import { Injectable, BadRequestException } from '@nestjs/common';
import { Database } from 'sqlite3';
import { StudentBaseInfoRepository } from './repositories/student-base-info.repository';
import { SubjectScoreRepository } from './repositories/subject-score.repository';
import { TempFileStorageService } from './temp-file-storage.service';
import { StudentBaseInfo } from './entities/student-base-info.entity';
import { SubjectScore } from './entities/subject-score.entity';
import { RecruitmentCode } from './entities/recruitment-code.entity';
import { UploadProgress } from './entities/upload-progress.entity';
import { FileUploadSummaryDto } from './dto/file-upload-summary.dto';
import { UploadFileRequestDto } from './dto/upload-file-request.dto';

interface SqliteStudentBaseInfo {
    rowid?: number;
    Mogib2: string;
    IdentifyNumber: string;
    SocialNumber: string;
    SchoolCode: string;
    CollegeAdmissionYear: string;
    SeleScCode: string;
    ApplicantScCode: string;
    GraduateYear: string;
    GraduateGrade: string;
    MasterSchoolYN: string;
    SpecializedSchoolYN: string;
    CorrectionRegisterYN: string;
    ExamNumber: string;
    UniqueFileName?: string;
    PictureFileName?: string;
}

interface SqliteSubjectScore {
    rowid?: number;
    Mogib2: string;
    IdentifyNumber: string;
    SeqNumber: number;
    SocialNumber: string;
    SchoolCode: string;
    Year: string;
    Grade: number;
    OrganizationCode: string;
    OrganizationName: string;
    CourceCode: string;
    CourceName: string;
    SubjectCode: string;
    SubjectName: string;
    Term: number;
    Unit?: string;
    Assessment?: string;
    Rank?: string;
    SameRank?: string;
    StudentCount?: string;
    OriginalScore?: string;
    AvgScore?: string;
    StandardDeviation?: string;
    RankingGrade?: string;
    RankingGradeCode?: string;
    Achievement?: string;
    AchievementCode?: string;
    AchievementRatio?: string;
    SubjectSeparationCode?: string;
}

@Injectable()
export class FileUploadService {
    constructor(
        private readonly studentBaseInfoRepository: StudentBaseInfoRepository,
        private readonly subjectScoreRepository: SubjectScoreRepository,
        private readonly tempFileStorageService: TempFileStorageService,
    ) {}

    async uploadAndMigrate(
        request: UploadFileRequestDto,
        file: Express.Multer.File,
        progressCallback: (progress: UploadProgress) => void,
    ): Promise<FileUploadSummaryDto> {
        progressCallback(UploadProgress.pending());

        try {
            // Save temporary file
            const { path: tempFilePath } = await this.tempFileStorageService.saveFile(file, request.fileName);
            progressCallback(UploadProgress.uploading(10, 'File saved, starting processing...'));

            // Validate file type
            if (!tempFilePath.endsWith('.db3') && !tempFilePath.endsWith('.db')) {
                throw new BadRequestException('Only SQLite database files (.db3, .db) are allowed');
            }

            // Clear existing data
            await this.clearExistingData(request.recruitmentSeasonId);
            progressCallback(UploadProgress.uploading(20, 'Cleared existing data'));

            // Process the SQLite file
            const { totalStudents, totalSubjectScores } = await this.processSqliteFile(
                tempFilePath,
                request.recruitmentSeasonId,
                progressCallback,
            );

            // Clean up temporary file
            await this.tempFileStorageService.remove(tempFilePath);

            progressCallback(UploadProgress.completed(totalStudents, 'Migration completed successfully'));

            return new FileUploadSummaryDto({
                recruitmentSeasonId: request.recruitmentSeasonId,
                totalStudents,
                totalSubjectScores,
                uploadedAt: new Date().toISOString(),
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            progressCallback(UploadProgress.failed(errorMessage));
            throw error;
        }
    }

    async getUploadSummary(recruitmentSeasonId: number): Promise<FileUploadSummaryDto | null> {
        const totalStudents = await this.studentBaseInfoRepository.countByRecruitmentSeasonId(recruitmentSeasonId);

        if (totalStudents === 0) {
            return null;
        }

        const totalSubjectScores = await this.subjectScoreRepository.countByRecruitmentSeasonId(recruitmentSeasonId);

        return new FileUploadSummaryDto({
            recruitmentSeasonId,
            totalStudents,
            totalSubjectScores,
            uploadedAt: new Date().toISOString(),
        });
    }

    private async clearExistingData(recruitmentSeasonId: number): Promise<void> {
        await this.subjectScoreRepository.deleteByRecruitmentSeasonId(recruitmentSeasonId);
        await this.studentBaseInfoRepository.deleteByRecruitmentSeasonId(recruitmentSeasonId);
    }

    private async processSqliteFile(
        filePath: string,
        recruitmentSeasonId: number,
        progressCallback: (progress: UploadProgress) => void,
    ): Promise<{ totalStudents: number; totalSubjectScores: number }> {
        return new Promise((resolve, reject) => {
            const db = new Database(filePath, err => {
                if (err) {
                    reject(new Error(`Failed to open SQLite database: ${err.message}`));
                    return;
                }

                this.migrateData(db, recruitmentSeasonId, progressCallback)
                    .then(resolve)
                    .catch(reject)
                    .finally(() => {
                        db.close();
                    });
            });
        });
    }

    private async migrateData(
        db: Database,
        recruitmentSeasonId: number,
        progressCallback: (progress: UploadProgress) => void,
    ): Promise<{ totalStudents: number; totalSubjectScores: number }> {
        // Get counts
        const studentCount = await this.getTableCount(db, 'StudentBaseInfo');
        const subjectScoreCount = await this.getTableCount(db, 'SubjectScore');

        progressCallback(UploadProgress.processing(0, studentCount + subjectScoreCount, 'Starting data migration...'));

        // Migrate students
        const studentMap = await this.migrateStudentBaseInfo(db, recruitmentSeasonId, progressCallback);

        // Migrate subject scores
        await this.migrateSubjectScores(db, studentMap, progressCallback);

        return {
            totalStudents: studentMap.size,
            totalSubjectScores: subjectScoreCount,
        };
    }

    private async getTableCount(db: Database, tableName: string): Promise<number> {
        return new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row: { count: number }) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    private async migrateStudentBaseInfo(
        db: Database,
        recruitmentSeasonId: number,
        progressCallback: (progress: UploadProgress) => void,
    ): Promise<Map<string, number>> {
        const studentMap = new Map<string, number>();
        const pageSize = 1000;
        const total = await this.getTableCount(db, 'StudentBaseInfo');
        let processed = 0;
        let lastProgressAt = 0;
        let lastRowId = 0;

        while (true) {
            const rows: SqliteStudentBaseInfo[] = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT rowid as rowid, * FROM StudentBaseInfo WHERE rowid > ? ORDER BY rowid LIMIT ?`,
                    [lastRowId, pageSize],
                    (err, results: SqliteStudentBaseInfo[]) => {
                        if (err) reject(err);
                        else resolve(results || []);
                    },
                );
            });

            if (rows.length === 0) break;

            const studentEntities: StudentBaseInfo[] = [];
            for (const student of rows) {
                try {
                    const recruitmentCode = RecruitmentCode.fromMogib2(student.Mogib2);
                    const studentEntity = StudentBaseInfo.create({
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
                    });
                    studentEntities.push(studentEntity);
                } catch (error) {
                    console.warn(`Skipping invalid student record: ${error}`);
                }
            }

            if (studentEntities.length > 0) {
                const savedStudents = await this.studentBaseInfoRepository.saveMany(studentEntities);
                for (const s of savedStudents) {
                    const key = `${s.recruitmentTypeCode}-${s.recruitmentUnitCode}:${s.identifyNumber}`;
                    studentMap.set(key, s.id);
                }
            }

            processed += rows.length;
            lastRowId = (rows[rows.length - 1].rowid as number) || lastRowId;

            const now = Date.now();
            if (now - lastProgressAt >= 1000) {
                lastProgressAt = now;
                progressCallback(
                    UploadProgress.processing(processed, total, `Migrated ${processed}/${total} student records`),
                );
            }
        }

        return studentMap;
    }

    private async migrateSubjectScores(
        db: Database,
        studentMap: Map<string, number>,
        progressCallback: (progress: UploadProgress) => void,
    ): Promise<void> {
        const pageSize = 1000;
        const total = await this.getTableCount(db, 'SubjectScore');
        let processed = 0;
        let lastProgressAt = 0;
        let lastRowId = 0;

        while (true) {
            const rows: SqliteSubjectScore[] = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT rowid as rowid, * FROM SubjectScore WHERE rowid > ? ORDER BY rowid LIMIT ?`,
                    [lastRowId, pageSize],
                    (err, results: SqliteSubjectScore[]) => {
                        if (err) reject(err);
                        else resolve(results || []);
                    },
                );
            });

            if (rows.length === 0) break;

            const scoreEntities: SubjectScore[] = [];
            for (const score of rows) {
                try {
                    const recruitmentCode = RecruitmentCode.fromMogib2(score.Mogib2);
                    const key = `${recruitmentCode.typeCode}-${recruitmentCode.unitCode}:${score.IdentifyNumber}`;
                    const studentBaseInfoId = studentMap.get(key);

                    if (studentBaseInfoId) {
                        const scoreEntity = SubjectScore.create({
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
                        });
                        scoreEntities.push(scoreEntity);
                    }
                } catch (error) {
                    console.warn(`Skipping invalid subject score record: ${error}`);
                }
            }

            if (scoreEntities.length > 0) {
                await this.subjectScoreRepository.saveMany(scoreEntities);
            }

            processed += rows.length;
            lastRowId = (rows[rows.length - 1].rowid as number) || lastRowId;

            const now = Date.now();
            if (now - lastProgressAt >= 1000) {
                lastProgressAt = now;
                progressCallback(
                    UploadProgress.processing(processed, total, `Migrated ${processed}/${total} subject score records`),
                );
            }
        }
    }
}
