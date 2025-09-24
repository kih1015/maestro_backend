import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubjectGroupMapping } from '../entities/subject-group-mapping.entity';
import { SubjectGroupMappingRepositoryInterface } from '../interfaces/subject-group-mapping.repository.interface';

@Injectable()
export class SubjectGroupMappingRepository implements SubjectGroupMappingRepositoryInterface {
    constructor(private readonly prisma: PrismaService) {}

    async saveMany(mappings: SubjectGroupMapping[]): Promise<SubjectGroupMapping[]> {
        const createData = mappings.map(mapping => ({
            recruitmentSeasonId: mapping.recruitmentSeasonId,
            rowNo: mapping.rowNo,
            category: mapping.category,
            subjectGroup: mapping.subjectGroup,
            curriculumCode: mapping.curriculumCode,
            curriculumName: mapping.curriculumName,
            courseCode: mapping.courseCode,
            courseName: mapping.courseName,
            subjectCode: mapping.subjectCode,
            subjectName: mapping.subjectName,
            requiredYn: mapping.requiredYn,
            includedYn: mapping.includedYn,
            note: mapping.note,
            updatedAt: new Date(),
        }));

        await this.prisma.subject_group_mappings.createMany({
            data: createData,
        });

        // Return created records with IDs
        const created = await this.prisma.subject_group_mappings.findMany({
            where: {
                recruitmentSeasonId: mappings[0].recruitmentSeasonId,
            },
            orderBy: { id: 'desc' },
            take: mappings.length,
        });

        return created.reverse().map(
            record =>
                new SubjectGroupMapping({
                    id: record.id,
                    recruitmentSeasonId: record.recruitmentSeasonId,
                    rowNo: record.rowNo || undefined,
                    category: record.category || undefined,
                    subjectGroup: record.subjectGroup || '',
                    curriculumCode: record.curriculumCode || undefined,
                    curriculumName: record.curriculumName || undefined,
                    courseCode: record.courseCode || undefined,
                    courseName: record.courseName || undefined,
                    subjectCode: record.subjectCode || undefined,
                    subjectName: record.subjectName || undefined,
                    requiredYn: record.requiredYn || undefined,
                    includedYn: record.includedYn || undefined,
                    note: record.note || undefined,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                }),
        );
    }

    async findByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<SubjectGroupMapping[]> {
        const records = await this.prisma.subject_group_mappings.findMany({
            where: { recruitmentSeasonId },
            orderBy: { rowNo: 'asc' },
        });

        return records.map(
            record =>
                new SubjectGroupMapping({
                    id: record.id,
                    recruitmentSeasonId: record.recruitmentSeasonId,
                    rowNo: record.rowNo || undefined,
                    category: record.category || undefined,
                    subjectGroup: record.subjectGroup || '',
                    curriculumCode: record.curriculumCode || undefined,
                    curriculumName: record.curriculumName || undefined,
                    courseCode: record.courseCode || undefined,
                    courseName: record.courseName || undefined,
                    subjectCode: record.subjectCode || undefined,
                    subjectName: record.subjectName || undefined,
                    requiredYn: record.requiredYn || undefined,
                    includedYn: record.includedYn || undefined,
                    note: record.note || undefined,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                }),
        );
    }

    async countByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<number> {
        return await this.prisma.subject_group_mappings.count({
            where: { recruitmentSeasonId },
        });
    }

    async deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void> {
        await this.prisma.subject_group_mappings.deleteMany({
            where: { recruitmentSeasonId },
        });
    }

    async findById(id: number): Promise<SubjectGroupMapping | null> {
        const record = await this.prisma.subject_group_mappings.findUnique({
            where: { id },
        });

        if (!record) return null;

        return new SubjectGroupMapping({
            id: record.id,
            recruitmentSeasonId: record.recruitmentSeasonId,
            rowNo: record.rowNo || undefined,
            category: record.category || undefined,
            subjectGroup: record.subjectGroup || '',
            curriculumCode: record.curriculumCode || undefined,
            curriculumName: record.curriculumName || undefined,
            courseCode: record.courseCode || undefined,
            courseName: record.courseName || undefined,
            subjectCode: record.subjectCode || undefined,
            subjectName: record.subjectName || undefined,
            requiredYn: record.requiredYn || undefined,
            includedYn: record.includedYn || undefined,
            note: record.note || undefined,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }

    async save(mapping: SubjectGroupMapping): Promise<SubjectGroupMapping> {
        const record = await this.prisma.subject_group_mappings.create({
            data: {
                recruitmentSeasonId: mapping.recruitmentSeasonId,
                rowNo: mapping.rowNo,
                category: mapping.category,
                subjectGroup: mapping.subjectGroup,
                curriculumCode: mapping.curriculumCode,
                curriculumName: mapping.curriculumName,
                courseCode: mapping.courseCode,
                courseName: mapping.courseName,
                subjectCode: mapping.subjectCode,
                subjectName: mapping.subjectName,
                requiredYn: mapping.requiredYn,
                includedYn: mapping.includedYn,
                note: mapping.note,
                updatedAt: new Date(),
            },
        });

        return new SubjectGroupMapping({
            id: record.id,
            recruitmentSeasonId: record.recruitmentSeasonId,
            rowNo: record.rowNo || undefined,
            category: record.category || undefined,
            subjectGroup: record.subjectGroup || '',
            curriculumCode: record.curriculumCode || undefined,
            curriculumName: record.curriculumName || undefined,
            courseCode: record.courseCode || undefined,
            courseName: record.courseName || undefined,
            subjectCode: record.subjectCode || undefined,
            subjectName: record.subjectName || undefined,
            requiredYn: record.requiredYn || undefined,
            includedYn: record.includedYn || undefined,
            note: record.note || undefined,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.subject_group_mappings.delete({
            where: { id },
        });
    }
}
