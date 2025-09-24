import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IStudentScoreResultRepository } from '../interfaces/student-score-result-repository.interface';
import { StudentScoreResult } from '../entities/student.entity';

@Injectable()
export class StudentScoreResultRepository implements IStudentScoreResultRepository {
    constructor(private prisma: PrismaService) {}

    async createMany(results: StudentScoreResult[]): Promise<void> {
        const data = results.map(result => ({
            studentBaseInfoId: result.studentBaseInfoId,
            finalScore: result.finalScore,
            ranking: 0, // Will be calculated later
            finalFormula: result.finalFormula,
            updatedAt: new Date(),
        }));

        await this.prisma.student_score_results.createMany({
            data,
            skipDuplicates: true,
        });
    }

    async deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void> {
        await this.prisma.student_score_results.deleteMany({
            where: {
                student_base_infos: {
                    recruitmentSeasonId,
                },
            },
        });
    }

    async findByStudentId(studentBaseInfoId: number): Promise<StudentScoreResult | null> {
        const result = await this.prisma.student_score_results.findFirst({
            where: {
                studentBaseInfoId,
            },
        });

        if (!result) return null;

        return new StudentScoreResult(
            result.studentBaseInfoId,
            0, // recruitmentSeasonId not available from this table
            result.finalScore,
            result.createdAt,
            result.id,
            result.ranking,
            result.finalFormula || undefined,
        );
    }

    async update(id: number, result: Partial<StudentScoreResult>): Promise<StudentScoreResult> {
        const updated = await this.prisma.student_score_results.update({
            where: { id },
            data: {
                ...(result.finalScore !== undefined && { finalScore: result.finalScore }),
                updatedAt: new Date(),
            },
        });

        return new StudentScoreResult(
            updated.studentBaseInfoId,
            0, // recruitmentSeasonId not available from this table
            updated.finalScore,
            updated.updatedAt,
            updated.id,
            updated.ranking,
            updated.finalFormula || undefined,
        );
    }
}
