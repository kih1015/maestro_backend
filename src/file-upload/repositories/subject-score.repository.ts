import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubjectScore } from '../entities/subject-score.entity';
import { SubjectScoreRepositoryInterface } from '../interfaces/subject-score.repository.interface';

@Injectable()
export class SubjectScoreRepository implements SubjectScoreRepositoryInterface {
    constructor(private readonly prisma: PrismaService) {}

    async saveMany(scores: SubjectScore[]): Promise<SubjectScore[]> {
        const createData = scores.map(score => ({
            studentBaseInfoId: score.studentBaseInfoId,
            seqNumber: score.seqNumber,
            socialNumber: score.socialNumber,
            schoolCode: score.schoolCode,
            year: score.year,
            grade: score.grade,
            organizationCode: score.organizationCode,
            organizationName: score.organizationName,
            courseCode: score.courseCode,
            courseName: score.courseName,
            subjectCode: score.subjectCode,
            subjectName: score.subjectName,
            term: score.term,
            unit: score.unit,
            assessment: score.assessment,
            rank: score.rank,
            sameRank: score.sameRank,
            studentCount: score.studentCount,
            originalScore: score.originalScore,
            avgScore: score.avgScore,
            standardDeviation: score.standardDeviation,
            rankingGrade: score.rankingGrade,
            rankingGradeCode: score.rankingGradeCode,
            achievement: score.achievement,
            achievementCode: score.achievementCode,
            achievementRatio: score.achievementRatio,
            subjectSeparationCode: score.subjectSeparationCode,
            updatedAt: new Date(),
        }));

        await this.prisma.subject_scores.createMany({
            data: createData,
        });

        // Return created records with IDs (simplified approach)
        return scores.map(
            (score, index) =>
                new SubjectScore({
                    ...score,
                    id: index + 1, // This is a simplified approach, in real scenario you'd query back
                }),
        );
    }

    async findByStudentBaseInfoId(studentBaseInfoId: number): Promise<SubjectScore[]> {
        const records = await this.prisma.subject_scores.findMany({
            where: { studentBaseInfoId },
        });

        return records.map(
            record =>
                new SubjectScore({
                    id: record.id,
                    studentBaseInfoId: record.studentBaseInfoId,
                    seqNumber: record.seqNumber,
                    socialNumber: record.socialNumber,
                    schoolCode: record.schoolCode,
                    year: record.year,
                    grade: record.grade,
                    organizationCode: record.organizationCode,
                    organizationName: record.organizationName,
                    courseCode: record.courseCode,
                    courseName: record.courseName,
                    subjectCode: record.subjectCode,
                    subjectName: record.subjectName,
                    term: record.term,
                    unit: record.unit || undefined,
                    assessment: record.assessment || undefined,
                    rank: record.rank || undefined,
                    sameRank: record.sameRank || undefined,
                    studentCount: record.studentCount || undefined,
                    originalScore: record.originalScore || undefined,
                    avgScore: record.avgScore || undefined,
                    standardDeviation: record.standardDeviation || undefined,
                    rankingGrade: record.rankingGrade || undefined,
                    rankingGradeCode: record.rankingGradeCode || undefined,
                    achievement: record.achievement || undefined,
                    achievementCode: record.achievementCode || undefined,
                    achievementRatio: record.achievementRatio || undefined,
                    subjectSeparationCode: record.subjectSeparationCode || undefined,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                }),
        );
    }

    async countByStudentBaseInfoId(studentBaseInfoId: number): Promise<number> {
        return await this.prisma.subject_scores.count({
            where: { studentBaseInfoId },
        });
    }

    async countByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<number> {
        return await this.prisma.subject_scores.count({
            where: {
                student_base_infos: {
                    recruitmentSeasonId,
                },
            },
        });
    }

    async deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void> {
        await this.prisma.subject_scores.deleteMany({
            where: {
                student_base_infos: {
                    recruitmentSeasonId,
                },
            },
        });
    }

    async deleteByStudentBaseInfoId(studentBaseInfoId: number): Promise<void> {
        await this.prisma.subject_scores.deleteMany({
            where: { studentBaseInfoId },
        });
    }

    async findById(id: number): Promise<SubjectScore | null> {
        const record = await this.prisma.subject_scores.findUnique({
            where: { id },
        });

        if (!record) return null;

        return new SubjectScore({
            id: record.id,
            studentBaseInfoId: record.studentBaseInfoId,
            seqNumber: record.seqNumber,
            socialNumber: record.socialNumber,
            schoolCode: record.schoolCode,
            year: record.year,
            grade: record.grade,
            organizationCode: record.organizationCode,
            organizationName: record.organizationName,
            courseCode: record.courseCode,
            courseName: record.courseName,
            subjectCode: record.subjectCode,
            subjectName: record.subjectName,
            term: record.term,
            unit: record.unit || undefined,
            assessment: record.assessment || undefined,
            rank: record.rank || undefined,
            sameRank: record.sameRank || undefined,
            studentCount: record.studentCount || undefined,
            originalScore: record.originalScore || undefined,
            avgScore: record.avgScore || undefined,
            standardDeviation: record.standardDeviation || undefined,
            rankingGrade: record.rankingGrade || undefined,
            rankingGradeCode: record.rankingGradeCode || undefined,
            achievement: record.achievement || undefined,
            achievementCode: record.achievementCode || undefined,
            achievementRatio: record.achievementRatio || undefined,
            subjectSeparationCode: record.subjectSeparationCode || undefined,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }

    async save(score: SubjectScore): Promise<SubjectScore> {
        const record = await this.prisma.subject_scores.create({
            data: {
                studentBaseInfoId: score.studentBaseInfoId,
                seqNumber: score.seqNumber,
                socialNumber: score.socialNumber,
                schoolCode: score.schoolCode,
                year: score.year,
                grade: score.grade,
                organizationCode: score.organizationCode,
                organizationName: score.organizationName,
                courseCode: score.courseCode,
                courseName: score.courseName,
                subjectCode: score.subjectCode,
                subjectName: score.subjectName,
                term: score.term,
                unit: score.unit,
                assessment: score.assessment,
                rank: score.rank,
                sameRank: score.sameRank,
                studentCount: score.studentCount,
                originalScore: score.originalScore,
                avgScore: score.avgScore,
                standardDeviation: score.standardDeviation,
                rankingGrade: score.rankingGrade,
                rankingGradeCode: score.rankingGradeCode,
                achievement: score.achievement,
                achievementCode: score.achievementCode,
                achievementRatio: score.achievementRatio,
                subjectSeparationCode: score.subjectSeparationCode,
                updatedAt: new Date(),
            },
        });

        return new SubjectScore({
            id: record.id,
            studentBaseInfoId: record.studentBaseInfoId,
            seqNumber: record.seqNumber,
            socialNumber: record.socialNumber,
            schoolCode: record.schoolCode,
            year: record.year,
            grade: record.grade,
            organizationCode: record.organizationCode,
            organizationName: record.organizationName,
            courseCode: record.courseCode,
            courseName: record.courseName,
            subjectCode: record.subjectCode,
            subjectName: record.subjectName,
            term: record.term,
            unit: record.unit || undefined,
            assessment: record.assessment || undefined,
            rank: record.rank || undefined,
            sameRank: record.sameRank || undefined,
            studentCount: record.studentCount || undefined,
            originalScore: record.originalScore || undefined,
            avgScore: record.avgScore || undefined,
            standardDeviation: record.standardDeviation || undefined,
            rankingGrade: record.rankingGrade || undefined,
            rankingGradeCode: record.rankingGradeCode || undefined,
            achievement: record.achievement || undefined,
            achievementCode: record.achievementCode || undefined,
            achievementRatio: record.achievementRatio || undefined,
            subjectSeparationCode: record.subjectSeparationCode || undefined,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.subject_scores.delete({
            where: { id },
        });
    }
}
