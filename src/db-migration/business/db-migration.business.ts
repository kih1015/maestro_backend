import { Injectable, BadRequestException } from '@nestjs/common';
import { RecruitmentCode } from '../entities/recruitment-code.entity';
import { MigrationProgress } from '../interfaces/migration-progress.interface';
import { PostgresStudentBaseInfo, PostgresSubjectScore } from '../repository/postgres-migration.repository';
import { SqliteStudentBaseInfo, SqliteSubjectScore } from '../repository/sqlite-reader.repository';

@Injectable()
export class DbMigrationBusiness {
    validateSqliteFile(filePath: string): void {
        if (!filePath.endsWith('.db3') && !filePath.endsWith('.db')) {
            throw new BadRequestException('Only SQLite database files (.db3, .db) are allowed');
        }
    }

    calculateProgressPercentage(
        processed: number,
        total: number,
        basePercentage: number,
        rangePercentage: number,
    ): number {
        return Math.floor((processed / total) * rangePercentage) + basePercentage;
    }

    createMigrationProgress(
        status: 'pending' | 'processing' | 'completed' | 'failed',
        percentage: number,
        message: string,
        processedRecords?: number,
        totalRecords?: number,
        error?: string,
    ): MigrationProgress {
        return {
            status,
            percentage,
            message,
            processedRecords,
            totalRecords,
            error,
        };
    }

    transformStudentBaseInfo(
        student: SqliteStudentBaseInfo,
        recruitmentSeasonId: number,
    ): PostgresStudentBaseInfo | null {
        try {
            const recruitmentCode = RecruitmentCode.fromMogib2(student.Mogib2);
            return {
                recruitmentSeasonId,
                recruitmentTypeCode: recruitmentCode.typeCode,
                recruitmentUnitCode: recruitmentCode.unitCode,
                identifyNumber: student.IdentifyNumber,
                socialNumber: student.SocialNumber,
                schoolCode: student.SchoolCode,
                collegeAdmissionYear: String(student.CollegeAdmissionYear),
                seleScCode: student.SeleScCode,
                applicantScCode: student.ApplicantScCode,
                graduateYear: String(student.GraduateYear),
                graduateGrade: student.GraduateGrade,
                masterSchoolYN: student.MasterSchoolYN,
                specializedSchoolYN: student.SpecializedSchoolYN,
                correctionRegisterYN: student.CorrectionRegisterYN,
                examNumber: student.ExamNumber,
                uniqueFileName: student.UniqueFileName,
                pictureFileName: student.PictureFileName,
            };
        } catch (error) {
            console.warn(`Skipping invalid student record: ${error}`);
            return null;
        }
    }

    transformSubjectScore(score: SqliteSubjectScore, studentMap: Map<string, number>): PostgresSubjectScore | null {
        try {
            const recruitmentCode = RecruitmentCode.fromMogib2(score.Mogib2);
            const key = `${recruitmentCode.typeCode}-${recruitmentCode.unitCode}:${score.IdentifyNumber}`;
            const studentBaseInfoId = studentMap.get(key);

            if (!studentBaseInfoId) {
                return null;
            }

            return {
                studentBaseInfoId,
                seqNumber: score.SeqNumber,
                socialNumber: score.SocialNumber,
                schoolCode: score.SchoolCode,
                year: String(score.Year),
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
        } catch (error) {
            console.warn(`Skipping invalid subject score record: ${error}`);
            return null;
        }
    }

    createStudentMapKey(typeCode: string, unitCode: string, identifyNumber: string): string {
        return `${typeCode}-${unitCode}:${identifyNumber}`;
    }

    shouldUpdateProgress(lastProgressAt: number, interval: number = 1000): boolean {
        return Date.now() - lastProgressAt >= interval;
    }
}
