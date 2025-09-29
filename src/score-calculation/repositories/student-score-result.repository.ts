import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StudentScoreResult } from '../entities/student.entity';

@Injectable()
export class StudentScoreResultRepository {
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
}
