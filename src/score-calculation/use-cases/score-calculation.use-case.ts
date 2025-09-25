import { Injectable, Logger } from '@nestjs/common';
import { StudentReadRepository } from '../repositories/student-read.repository';
import { StudentScoreResultRepository } from '../repositories/student-score-result.repository';
import { SubjectScoreCalculationDetailRepository } from '../repositories/subject-score-calculation-detail.repository';
import { StudentScoreResult, SubjectScoreCalculationDetail } from '../entities/student.entity';
import { EventsService } from '../../events/events.service';

export interface CalculateScoresInput {
    readonly recruitmentSeasonId: number;
}

@Injectable()
export class ScoreCalculationUseCase {
    private readonly logger = new Logger(ScoreCalculationUseCase.name);

    constructor(
        private readonly studentRepository: StudentReadRepository,
        private readonly scoreResultRepository: StudentScoreResultRepository,
        private readonly subjectDetailRepository: SubjectScoreCalculationDetailRepository,
        private readonly eventsService: EventsService,
    ) {}

    async calculateScores(
        input: CalculateScoresInput,
        options?: { userId?: number },
    ): Promise<{
        calculated: number;
    }> {
        const userId = options?.userId;
        const emit = (eventType: string, data: unknown) => {
            if (!userId) return;
            this.eventsService.sendToUser(userId, `score.${eventType}`, {
                ...(data as any),
                recruitmentSeasonId: input.recruitmentSeasonId,
            });
        };

        try {
            const startedAtMs = Date.now();
            this.logger.log(`[ScoreCalc] start season=${input.recruitmentSeasonId}`);

            const total = await this.studentRepository.countStudents(input.recruitmentSeasonId);
            this.logger.log(`[ScoreCalc] season=${input.recruitmentSeasonId} totalStudents=${total}`);

            let calculated = 0;
            let processed = 0;
            let missingCalculator = 0;
            let invalidFinalScore = 0;

            emit('start', {
                total,
            });

            // Clear previous results/details for the season
            await this.subjectDetailRepository.deleteByRecruitmentSeasonId(input.recruitmentSeasonId);
            await this.scoreResultRepository.deleteByRecruitmentSeasonId(input.recruitmentSeasonId);
            this.logger.log(`[ScoreCalc] season=${input.recruitmentSeasonId} previousDetails/ResultsCleared`);

            const batchSize = 100;
            let lastId: number | null = null;

            while (true) {
                const batch = await this.studentRepository.streamStudents(input.recruitmentSeasonId, lastId, batchSize);

                if (batch.length === 0) break;

                const resultsBatch: StudentScoreResult[] = [];
                const detailsBatch: SubjectScoreCalculationDetail[] = [];

                for (const student of batch) {
                    try {
                        // Student object performs its own calculation
                        student.calculate();
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                        this.logger.warn(`Failed to calculate for student ${student.identifyNumber}: ${errorMessage}`);
                        emit('student_error', {
                            studentId: student.identifyNumber,
                            error: errorMessage,
                        });
                        missingCalculator += 1;
                        continue;
                    }

                    const result = student.scoreResult;
                    if (!result || result.finalScore === 0 || !Number.isFinite(result.finalScore)) {
                        invalidFinalScore += 1;
                    } else {
                        // Set the recruitment season ID
                        result.recruitmentSeasonId = input.recruitmentSeasonId;
                        result.studentBaseInfoId = student.id;
                        resultsBatch.push(result);

                        // Collect calculation details from student's subjects
                        const subjectDetails = student.subjectScores
                            .map(s => s.calculationDetail)
                            .filter(Boolean) as SubjectScoreCalculationDetail[];

                        if (subjectDetails.length > 0) {
                            detailsBatch.push(...subjectDetails);
                        }
                    }
                    calculated += 1;
                }

                // Save batches
                if (resultsBatch.length > 0) {
                    await this.scoreResultRepository.createMany(resultsBatch);
                }
                if (detailsBatch.length > 0) {
                    await this.subjectDetailRepository.saveMany(detailsBatch);
                }

                processed += batch.length;
                if (processed % 100 === 0) {
                    emit('progress', {
                        processed,
                        calculated,
                        total,
                    });
                    this.logger.log(
                        `[ScoreCalc] season=${input.recruitmentSeasonId} progress processed=${processed} calculated=${calculated}/${total}`,
                    );
                }

                lastId = batch[batch.length - 1]?.id ?? null;
            }

            // Send final progress and completion events
            emit('progress', {
                processed,
                calculated,
                total,
            });

            emit('done', {
                calculated,
                total,
                missingCalculator,
                invalidFinalScore,
                duration: Date.now() - startedAtMs,
            });

            const tookMs = Date.now() - startedAtMs;
            this.logger.log(
                `[ScoreCalc] done season=${input.recruitmentSeasonId} processed=${processed} calculated=${calculated}/${total} missingCalculator=${missingCalculator} invalidFinalScore=${invalidFinalScore} tookMs=${tookMs}`,
            );

            return { calculated };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`[ScoreCalc] error season=${input.recruitmentSeasonId}: ${errorMessage}`, errorStack);
            emit('error', {
                message: errorMessage,
                timestamp: new Date().toISOString(),
            });
            throw error;
        }
    }
}
