import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IStudentReadRepository, StudentFilters } from '../interfaces/student-read-repository.interface';
import { Student, Subject } from '../entities/student.entity';
import { StudentFactory } from '../entities/student-factory.entity';
import { SortOrder } from '../dto/list-students.dto';
import { Prisma } from '@prisma/client';

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
        const idCondition = lastId !== null ? Prisma.sql`AND sbi.id > ${lastId}` : Prisma.empty;

        interface RawStudentRow {
            id: number;
            identifyNumber: string;
            recruitmentTypeCode: string;
            recruitmentUnitCode: string;
            graduateYear: string;
            applicantScCode: string | null;
            graduateGrade: string | null;
            subjectScores: Array<{
                id: number;
                seqNumber: number;
                subjectName: string;
                subjectCode: string;
                subjectSeparationCode: string | null;
                rankingGrade: string | null;
                achievement: string | null;
                assessment: string;
                originalScore: string | null;
                unit: string | null;
                grade: number;
                term: number;
                studentCount: number;
                rank: number;
                sameRank: number;
                subjectGroup: { name: string } | null;
            }>;
        }

        const result = await this.prisma.$queryRaw<RawStudentRow[]>`
            SELECT
                sbi.*,
                json_agg(
                    json_build_object(
                        'id', ss.id,
                        'seqNumber', ss."seqNumber",
                        'subjectName', ss."subjectName",
                        'subjectCode', ss."subjectCode",
                        'subjectSeparationCode', ss."subjectSeparationCode",
                        'rankingGrade', ss."rankingGrade",
                        'achievement', ss.achievement,
                        'assessment', ss.assessment,
                        'originalScore', ss."originalScore",
                        'unit', ss.unit,
                        'grade', ss.grade,
                        'term', ss.term,
                        'studentCount', ss."studentCount",
                        'rank', ss.rank,
                        'sameRank', ss."sameRank",
                        'subjectGroup', CASE WHEN sgm."subjectGroup" IS NOT NULL
                                           THEN json_build_object('name', sgm."subjectGroup")
                                           ELSE NULL END
                    )
                    ORDER BY ss.id
                ) as "subjectScores"
            FROM student_base_infos sbi
            LEFT JOIN subject_scores ss ON sbi.id = ss."studentBaseInfoId"
            LEFT JOIN subject_group_mappings sgm ON (
                sbi."recruitmentSeasonId" = sgm."recruitmentSeasonId" AND
                ss."organizationCode" = sgm."curriculumCode" AND
                ss."courseCode" = sgm."courseCode" AND
                ss."subjectCode" = sgm."subjectCode"
            )
            WHERE sbi."recruitmentSeasonId" = ${recruitmentSeasonId}
            ${idCondition}
            GROUP BY sbi.id
            ORDER BY sbi.id ASC
            LIMIT ${batchSize}
        `;

        return result.map(student => {
            const subjects = student.subjectScores.map(
                subject =>
                    new Subject({
                        id: subject.id,
                        seqNumber: subject.seqNumber,
                        subjectName: subject.subjectName,
                        subjectCode: subject.subjectCode,
                        subjectGroup: subject.subjectGroup?.name ?? null,
                        subjectSeparationCode: subject.subjectSeparationCode || '',
                        rankingGrade: subject.rankingGrade || '',
                        achievement: subject.achievement || '',
                        assessment: subject.assessment,
                        originalScore: subject.originalScore ? parseFloat(subject.originalScore) : null,
                        unit: subject.unit || '',
                        grade: subject.grade,
                        term: subject.term,
                        studentCount: subject.studentCount?.toString(),
                        rank: subject.rank?.toString(),
                        sameRank: subject.sameRank?.toString(),
                    }),
            );

            return StudentFactory.create({
                id: student.id,
                identifyNumber: student.identifyNumber,
                recruitmentTypeCode: student.recruitmentTypeCode,
                recruitmentUnitCode: student.recruitmentUnitCode,
                graduateYear: student.graduateYear,
                applicantScCode: student.applicantScCode || '',
                graduateGrade: student.graduateGrade || '',
                subjectScores: subjects,
                recruitmentSeasonId: recruitmentSeasonId,
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

            if (filters.calculationStatus) {
                const statusArray = Array.isArray(filters.calculationStatus)
                    ? filters.calculationStatus
                    : [filters.calculationStatus];

                if (statusArray.includes('completed')) {
                    whereClause.student_score_results = {
                        isNot: null,
                    };
                }

                if (statusArray.includes('pending') || statusArray.includes('not_completed')) {
                    whereClause.student_score_results = {
                        is: null,
                    };
                }
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

        // Build sort clause - always put students with calculations first, uncalculated at the end
        let orderBy: Record<string, unknown>[] = [];

        if (sort) {
            switch (sort) {
                case SortOrder.SCORE_ASC:
                    orderBy = [
                        { student_score_results: { finalScore: 'asc' } },
                        { id: 'asc' },
                    ];
                    break;
                case SortOrder.SCORE_DESC:
                    orderBy = [
                        { student_score_results: { finalScore: 'desc' } },
                        { id: 'asc' },
                    ];
                    break;
                default:
                    orderBy = [
                        { student_score_results: { finalScore: 'desc' } },
                        { id: 'asc' },
                    ];
                    break;
            }
        } else {
            // Default sorting: completed calculations first, then by id
            orderBy = [{ student_score_results: { finalScore: 'desc' } }, { id: 'asc' }];
        }

        // Build filter conditions
        let filterConditions = Prisma.empty;

        if (query) {
            filterConditions = Prisma.sql`
                AND (sbi."identifyNumber" ILIKE ${`%${query}%`}
                OR sbi."examNumber" ILIKE ${`%${query}%`})
            `;
        }

        if (filters) {
            if (filters.graduateYearFrom || filters.graduateYearTo) {
                if (filters.graduateYearFrom && filters.graduateYearTo) {
                    filterConditions = Prisma.sql`${filterConditions} AND sbi."graduateYear" >= ${filters.graduateYearFrom} AND sbi."graduateYear" <= ${filters.graduateYearTo}`;
                } else if (filters.graduateYearFrom) {
                    filterConditions = Prisma.sql`${filterConditions} AND sbi."graduateYear" >= ${filters.graduateYearFrom}`;
                } else if (filters.graduateYearTo) {
                    filterConditions = Prisma.sql`${filterConditions} AND sbi."graduateYear" <= ${filters.graduateYearTo}`;
                }
            }

            if (filters.graduateGrade) {
                const gradeArray = Array.isArray(filters.graduateGrade) ? filters.graduateGrade : [filters.graduateGrade];
                filterConditions = Prisma.sql`${filterConditions} AND sbi."graduateGrade" = ANY(${gradeArray})`;
            }

            if (filters.recruitmentTypeCode) {
                const typeArray = Array.isArray(filters.recruitmentTypeCode) ? filters.recruitmentTypeCode : [filters.recruitmentTypeCode];
                filterConditions = Prisma.sql`${filterConditions} AND sbi."recruitmentTypeCode" = ANY(${typeArray})`;
            }

            if (filters.recruitmentUnitCode) {
                const unitArray = Array.isArray(filters.recruitmentUnitCode) ? filters.recruitmentUnitCode : [filters.recruitmentUnitCode];
                filterConditions = Prisma.sql`${filterConditions} AND sbi."recruitmentUnitCode" = ANY(${unitArray})`;
            }

            if (filters.applicantScCode) {
                const scArray = Array.isArray(filters.applicantScCode) ? filters.applicantScCode : [filters.applicantScCode];
                filterConditions = Prisma.sql`${filterConditions} AND sbi."applicantScCode" = ANY(${scArray})`;
            }

            if (filters.calculationStatus) {
                const statusArray = Array.isArray(filters.calculationStatus) ? filters.calculationStatus : [filters.calculationStatus];

                if (statusArray.includes('completed') && !statusArray.includes('pending') && !statusArray.includes('not_completed')) {
                    filterConditions = Prisma.sql`${filterConditions} AND ssr."finalScore" IS NOT NULL`;
                } else if ((statusArray.includes('pending') || statusArray.includes('not_completed')) && !statusArray.includes('completed')) {
                    filterConditions = Prisma.sql`${filterConditions} AND ssr."finalScore" IS NULL`;
                }
            }
        }

        // Get paginated results - use raw SQL to handle nulls last properly
        const studentsRaw = await this.prisma.$queryRaw<Array<{
            id: number;
            identifyNumber: string;
            examNumber: string | null;
            graduateYear: string;
            graduateGrade: string | null;
            recruitmentTypeCode: string;
            recruitmentUnitCode: string;
            applicantScCode: string | null;
            recruitmentSeasonId: number;
            finalScore: number | null;
            recruitmentUnitName: string | null;
            recruitmentTypeName: string | null;
        }>>`
            SELECT
                sbi.id,
                sbi."identifyNumber",
                sbi."examNumber",
                sbi."graduateYear",
                sbi."graduateGrade",
                sbi."recruitmentTypeCode",
                sbi."recruitmentUnitCode",
                sbi."applicantScCode",
                sbi."recruitmentSeasonId",
                ssr."finalScore",
                ru."unitName" as "recruitmentUnitName",
                at."typeName" as "recruitmentTypeName"
            FROM student_base_infos sbi
            LEFT JOIN student_score_results ssr ON sbi.id = ssr."studentBaseInfoId"
            LEFT JOIN recruitment_seasons rs ON sbi."recruitmentSeasonId" = rs.id
            LEFT JOIN recruitment_units ru ON rs.id = ru."recruitmentSeasonId"
                AND sbi."recruitmentUnitCode" = ru."unitCode"::text
            LEFT JOIN admission_types at ON rs.id = at."recruitmentSeasonId"
                AND sbi."recruitmentTypeCode" = at."typeCode"::text
            WHERE sbi."recruitmentSeasonId" = ${recruitmentSeasonId}
            ${filterConditions}
            ORDER BY
                CASE WHEN ssr."finalScore" IS NULL THEN 1 ELSE 0 END,
                ${sort === SortOrder.SCORE_ASC ?
                    Prisma.sql`ssr."finalScore" ASC` :
                    Prisma.sql`ssr."finalScore" DESC`
                },
                sbi.id ASC
            LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
        `;

        const students = studentsRaw;

        const items = students.map(student => {
            return {
                id: student.id,
                identifyNumber: student.identifyNumber,
                examNumber: student.examNumber || '',
                graduateYear: student.graduateYear,
                graduateGrade: student.graduateGrade || undefined,
                recruitmentTypeCode: student.recruitmentTypeCode,
                recruitmentTypeName: student.recruitmentTypeName || undefined,
                recruitmentUnitCode: student.recruitmentUnitCode,
                recruitmentUnitName: student.recruitmentUnitName || undefined,
                applicantScCode: student.applicantScCode || undefined,
                finalScore: student.finalScore || undefined,
            };
        });

        return { items, total, completed };
    }

    async findByIdentifyNumber(recruitmentSeasonId: number, identifyNumber: string): Promise<Student | null> {
        interface RawStudentRow {
            id: number;
            identifyNumber: string;
            recruitmentTypeCode: string;
            recruitmentUnitCode: string;
            graduateYear: string;
            applicantScCode: string | null;
            graduateGrade: string | null;
            subjectScores: Array<{
                id: number;
                seqNumber: number;
                subjectName: string;
                subjectCode: string;
                subjectSeparationCode: string | null;
                rankingGrade: string | null;
                achievement: string | null;
                assessment: string;
                originalScore: string | null;
                unit: string | null;
                grade: number;
                term: number;
                studentCount: number;
                rank: number;
                sameRank: number;
                subjectGroup: { name: string } | null;
            }>;
        }

        const result = await this.prisma.$queryRaw<RawStudentRow[]>`
            SELECT
                sbi.*,
                json_agg(
                    json_build_object(
                        'id', ss.id,
                        'seqNumber', ss."seqNumber",
                        'subjectName', ss."subjectName",
                        'subjectCode', ss."subjectCode",
                        'subjectSeparationCode', ss."subjectSeparationCode",
                        'rankingGrade', ss."rankingGrade",
                        'achievement', ss.achievement,
                        'assessment', ss.assessment,
                        'originalScore', ss."originalScore",
                        'unit', ss.unit,
                        'grade', ss.grade,
                        'term', ss.term,
                        'studentCount', ss."studentCount",
                        'rank', ss.rank,
                        'sameRank', ss."sameRank",
                        'subjectGroup', CASE WHEN sgm."subjectGroup" IS NOT NULL
                                           THEN json_build_object('name', sgm."subjectGroup")
                                           ELSE NULL END
                    )
                    ORDER BY ss.id
                ) as "subjectScores"
            FROM student_base_infos sbi
            LEFT JOIN subject_scores ss ON sbi.id = ss."studentBaseInfoId"
            LEFT JOIN subject_group_mappings sgm ON (
                sbi."recruitmentSeasonId" = sgm."recruitmentSeasonId" AND
                ss."organizationCode" = sgm."curriculumCode" AND
                ss."courseCode" = sgm."courseCode" AND
                ss."subjectCode" = sgm."subjectCode"
            )
            WHERE sbi."recruitmentSeasonId" = ${recruitmentSeasonId}
            AND sbi."identifyNumber" = ${identifyNumber}
            GROUP BY sbi.id
        `;

        if (result.length === 0) return null;

        const student = result[0];
        const subjects = student.subjectScores.map(
            subject =>
                new Subject({
                    id: subject.id,
                    seqNumber: subject.seqNumber,
                    subjectName: subject.subjectName,
                    subjectCode: subject.subjectCode,
                    subjectGroup: subject.subjectGroup?.name ?? null,
                    subjectSeparationCode: subject.subjectSeparationCode || '',
                    rankingGrade: subject.rankingGrade || '',
                    achievement: subject.achievement || '',
                    assessment: subject.assessment,
                    originalScore: subject.originalScore ? parseFloat(subject.originalScore) : null,
                    unit: subject.unit || '',
                    grade: subject.grade,
                    term: subject.term,
                    studentCount: subject.studentCount?.toString(),
                    rank: subject.rank?.toString(),
                    sameRank: subject.sameRank?.toString(),
                }),
        );

        return StudentFactory.create({
            id: student.id,
            identifyNumber: student.identifyNumber,
            recruitmentTypeCode: student.recruitmentTypeCode,
            recruitmentUnitCode: student.recruitmentUnitCode,
            graduateYear: student.graduateYear,
            applicantScCode: student.applicantScCode || '',
            graduateGrade: student.graduateGrade || '',
            subjectScores: subjects,
            recruitmentSeasonId: recruitmentSeasonId,
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
