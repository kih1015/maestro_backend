import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISubjectScoreCalculationDetailRepository } from '../interfaces/subject-score-calculation-detail-repository.interface';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

@Injectable()
export class SubjectScoreCalculationDetailRepository implements ISubjectScoreCalculationDetailRepository {
    constructor(private prisma: PrismaService) {}

    async saveMany(details: SubjectScoreCalculationDetail[]): Promise<void> {
        const data = details.map(detail => ({
            subjectScoreId: detail.subjectScoreId,
            isReflected: detail.isReflected,
            nonReflectionReason: detail.nonReflectionReason,
            convertedScore: detail.convertedScore,
            convertedBaseValue: detail.convertedBaseValue as 'GRADE' | 'ACHIEVEMENT' | 'PERCENTILE' | 'Z_SCORE' | null,
            conversionFormula: detail.conversionFormula,
            updatedAt: new Date(),
        }));

        await this.prisma.subject_score_calculation_details.createMany({
            data,
            skipDuplicates: true,
        });
    }

    async deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void> {
        await this.prisma.subject_score_calculation_details.deleteMany({
            where: {
                subject_scores: {
                    student_base_infos: {
                        recruitmentSeasonId,
                    },
                },
            },
        });
    }

    async findBySubjectScoreIds(subjectScoreIds: number[]): Promise<SubjectScoreCalculationDetail[]> {
        if (subjectScoreIds.length === 0) return [];

        const details = await this.prisma.subject_score_calculation_details.findMany({
            where: {
                subjectScoreId: {
                    in: subjectScoreIds,
                },
            },
        });

        return details.map(
            detail =>
                new SubjectScoreCalculationDetail({
                    id: detail.id,
                    subjectScoreId: detail.subjectScoreId,
                    isReflected: detail.isReflected,
                    nonReflectionReason: detail.nonReflectionReason,
                    convertedScore: detail.convertedScore,
                    convertedBaseValue: detail.convertedBaseValue as string,
                    conversionFormula: detail.conversionFormula,
                }),
        );
    }

    async findBySubjectScoreId(subjectScoreId: number): Promise<SubjectScoreCalculationDetail | null> {
        const detail = await this.prisma.subject_score_calculation_details.findFirst({
            where: {
                subjectScoreId,
            },
        });

        if (!detail) return null;

        return new SubjectScoreCalculationDetail({
            id: detail.id,
            subjectScoreId: detail.subjectScoreId,
            isReflected: detail.isReflected,
            nonReflectionReason: detail.nonReflectionReason,
            convertedScore: detail.convertedScore,
            convertedBaseValue: detail.convertedBaseValue as string,
            conversionFormula: detail.conversionFormula,
        });
    }
}
