import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IStudentReadRepository, StudentFilters } from '../interfaces/student-read-repository.interface';
import { Student, Subject } from '../entities/student.entity';
import { StudentFactory } from '../entities/student-factory.entity';
import { SortOrder } from '../dto/list-students.dto';

@Injectable()
export class StudentReadRepository implements IStudentReadRepository {
    constructor(private prisma: PrismaService) {}

    async countStudents(recruitmentSeasonId: number): Promise<number> {
        return this.prisma.student_base_infos.count({
            where: {
                recruitmentSeasonId,
            },
        });
    }

    async countResultsForSeason(recruitmentSeasonId: number): Promise<number> {
        return this.prisma.student_score_results.count({
            where: {
                student_base_infos: {
                    recruitmentSeasonId,
                },
            },
        });
    }

    async streamStudents(recruitmentSeasonId: number, lastId: number | null, batchSize: number): Promise<Student[]> {
        const whereClause = {
            recruitmentSeasonId,
            ...(lastId && { id: { gt: lastId } }),
        };

        const students = await this.prisma.student_base_infos.findMany({
            where: whereClause,
            include: {
                subject_scores: true,
                recruitment_seasons: true,
            },
            orderBy: { id: 'asc' },
            take: batchSize,
        });

        return students.map(student => {
            const subjects = student.subject_scores.map(
                subject =>
                    new Subject({
                        id: subject.id,
                        seqNumber: subject.seqNumber,
                        subjectName: subject.subjectName,
                        subjectCode: subject.subjectCode,
                        subjectGroup: subject.subjectSeparationCode, // Using separation code as group for now
                        subjectSeparationCode: subject.subjectSeparationCode || '',
                        rankingGrade: subject.rankingGrade || '',
                        achievement: subject.achievement || '',
                        assessment: subject.assessment,
                        originalScore: subject.originalScore ? parseFloat(subject.originalScore) : null,
                        unit: subject.unit || '',
                        grade: subject.grade,
                        term: subject.term,
                        studentCount: subject.studentCount,
                        rank: subject.rank,
                        sameRank: subject.sameRank,
                    }),
            );

            return StudentFactory.create({
                id: student.id,
                identifyNumber: student.identifyNumber,
                recruitmentTypeCode: student.recruitmentTypeCode,
                recruitmentUnitCode: student.recruitmentUnitCode,
                graduateYear: student.graduateYear,
                applicantScCode: student.applicantScCode,
                graduateGrade: student.graduateGrade,
                subjectScores: subjects,
                universityCode: student.recruitment_seasons.universityCode,
            });
        });
    }

    async listStudents(
        recruitmentSeasonId: number,
        page: number,
        pageSize: number,
        query?: string,
        filters?: StudentFilters,
        sort?: SortOrder,
    ): Promise<{
        items: Array<{
            id: number;
            identifyNumber: string;
            examNumber: string;
            graduateYear: string;
            graduateGrade?: string;
            recruitmentTypeCode: string;
            recruitmentTypeName?: string;
            recruitmentUnitCode: string;
            recruitmentUnitName?: string;
            applicantScCode?: string;
            finalScore?: number;
        }>;
        total: number;
        completed: number;
    }> {
        const whereClause: Record<string, unknown> = {
            recruitmentSeasonId,
        };

        // Add search query
        if (query) {
            whereClause.OR = [{ identifyNumber: { contains: query } }, { examNumber: { contains: query } }];
        }

        // Add filters
        if (filters) {
            if (filters.graduateYearFrom || filters.graduateYearTo) {
                whereClause.graduateYear = {
                    ...(filters.graduateYearFrom && { gte: filters.graduateYearFrom }),
                    ...(filters.graduateYearTo && { lte: filters.graduateYearTo }),
                };
            }

            if (filters.graduateGrade) {
                whereClause.graduateGrade = Array.isArray(filters.graduateGrade)
                    ? { in: filters.graduateGrade }
                    : filters.graduateGrade;
            }

            if (filters.recruitmentTypeCode) {
                whereClause.recruitmentTypeCode = Array.isArray(filters.recruitmentTypeCode)
                    ? { in: filters.recruitmentTypeCode }
                    : filters.recruitmentTypeCode;
            }

            if (filters.recruitmentUnitCode) {
                whereClause.recruitmentUnitCode = Array.isArray(filters.recruitmentUnitCode)
                    ? { in: filters.recruitmentUnitCode }
                    : filters.recruitmentUnitCode;
            }

            if (filters.applicantScCode) {
                whereClause.applicantScCode = Array.isArray(filters.applicantScCode)
                    ? { in: filters.applicantScCode }
                    : filters.applicantScCode;
            }
        }

        // Get total count
        const total = await this.prisma.student_base_infos.count({ where: whereClause });

        // Get completed count
        const completed = await this.prisma.student_score_results.count({
            where: {
                student_base_infos: {
                    recruitmentSeasonId,
                },
            },
        });

        // Build sort clause
        let orderBy: Record<string, unknown> = { id: 'asc' };
        if (sort) {
            switch (sort) {
                case SortOrder.SCORE_ASC:
                    orderBy = { student_score_results: { finalScore: 'asc' } };
                    break;
                case SortOrder.SCORE_DESC:
                    orderBy = { student_score_results: { finalScore: 'desc' } };
                    break;
            }
        }

        // Get paginated results
        const students = await this.prisma.student_base_infos.findMany({
            where: whereClause,
            include: {
                student_score_results: true,
                recruitment_seasons: {
                    include: {
                        recruitment_units: true,
                        admission_types: true,
                    },
                },
            },
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        const items = students.map(student => {
            const recruitmentUnit = student.recruitment_seasons.recruitment_units.find(
                unit => unit.unitCode.toString() === student.recruitmentUnitCode,
            );
            const admissionType = student.recruitment_seasons.admission_types.find(
                type => type.typeCode.toString() === student.recruitmentTypeCode,
            );

            return {
                id: student.id,
                identifyNumber: student.identifyNumber,
                examNumber: student.examNumber || '',
                graduateYear: student.graduateYear,
                graduateGrade: student.graduateGrade,
                recruitmentTypeCode: student.recruitmentTypeCode,
                recruitmentTypeName: admissionType?.typeName,
                recruitmentUnitCode: student.recruitmentUnitCode,
                recruitmentUnitName: recruitmentUnit?.unitName,
                applicantScCode: student.applicantScCode,
                finalScore: student.student_score_results?.finalScore,
            };
        });

        return { items, total, completed };
    }

    async findByIdentifyNumber(recruitmentSeasonId: number, identifyNumber: string): Promise<Student | null> {
        const student = await this.prisma.student_base_infos.findFirst({
            where: {
                recruitmentSeasonId,
                identifyNumber,
            },
            include: {
                subject_scores: true,
                recruitment_seasons: true,
            },
        });

        if (!student) return null;

        const subjects = student.subject_scores.map(
            subject =>
                new Subject({
                    id: subject.id,
                    seqNumber: subject.seqNumber,
                    subjectName: subject.subjectName,
                    subjectCode: subject.subjectCode,
                    subjectGroup: subject.subjectSeparationCode, // Using separation code as group for now
                    subjectSeparationCode: subject.subjectSeparationCode || '',
                    rankingGrade: subject.rankingGrade || '',
                    achievement: subject.achievement || '',
                    assessment: subject.assessment,
                    originalScore: subject.originalScore ? parseFloat(subject.originalScore) : null,
                    unit: subject.unit || '',
                    grade: subject.grade,
                    term: subject.term,
                    studentCount: subject.studentCount,
                    rank: subject.rank,
                    sameRank: subject.sameRank,
                }),
        );

        return StudentFactory.create({
            id: student.id,
            identifyNumber: student.identifyNumber,
            recruitmentTypeCode: student.recruitmentTypeCode,
            recruitmentUnitCode: student.recruitmentUnitCode,
            graduateYear: student.graduateYear,
            applicantScCode: student.applicantScCode,
            graduateGrade: student.graduateGrade,
            subjectScores: subjects,
            universityCode: student.recruitment_seasons.universityCode,
        });
    }

    async exportFinalScores(
        recruitmentSeasonId: number,
    ): Promise<Array<{ identityNumber: string; finalScore: number }>> {
        const results = await this.prisma.student_score_results.findMany({
            where: {
                student_base_infos: {
                    recruitmentSeasonId,
                },
            },
            include: {
                student_base_infos: true,
            },
            orderBy: {
                finalScore: 'desc',
            },
        });

        return results.map(result => ({
            identityNumber: result.student_base_infos.identifyNumber,
            finalScore: result.finalScore,
        }));
    }

    async getStudentExtraInfo(studentBaseInfoId: number): Promise<{
        finalFormula: string | null;
        examNumber: string | null;
    }> {
        const student = await this.prisma.student_base_infos.findUnique({
            where: { id: studentBaseInfoId },
            include: {
                student_score_results: true,
            },
        });

        return {
            finalFormula: student?.student_score_results?.finalFormula || null,
            examNumber: student?.examNumber || null,
        };
    }
}
