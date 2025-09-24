import { Injectable, Logger } from '@nestjs/common';
import { StudentReadRepository } from './repositories/student-read.repository';
import { StudentScoreResultRepository } from './repositories/student-score-result.repository';
import { SubjectScoreCalculationDetailRepository } from './repositories/subject-score-calculation-detail.repository';
import { StudentScoreResult, SubjectScoreCalculationDetail } from './entities/student.entity';
import { ListStudentsDto } from './dto/list-students.dto';
import { GetStudentDetailDto } from './dto/student-detail.dto';
import { GetSummaryDto } from './dto/summary.dto';
import { ExportScoresDto } from './dto/export.dto';
import { StudentFilters } from './interfaces/student-read-repository.interface';
import { EventsService } from '../events/events.service';
import * as XLSX from 'xlsx';

export interface CalculateScoresInput {
    readonly recruitmentSeasonId: number;
}

@Injectable()
export class ScoreCalculationService {
    private readonly logger = new Logger(ScoreCalculationService.name);

    constructor(
        private readonly studentRepository: StudentReadRepository,
        private readonly scoreResultRepository: StudentScoreResultRepository,
        private readonly subjectDetailRepository: SubjectScoreCalculationDetailRepository,
        private readonly eventsService: EventsService,
    ) {}

    /**
     * Calculate scores for all students in a recruitment season
     */
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

    /**
     * Get calculation summary for a recruitment season
     */
    async getSummary(dto: GetSummaryDto) {
        const [totalStudents, totalResults] = await Promise.all([
            this.studentRepository.countStudents(dto.recruitmentSeasonId),
            this.studentRepository.countResultsForSeason(dto.recruitmentSeasonId),
        ]);

        return {
            success: true,
            data: {
                totalStudents,
                totalResults,
                studentsWithResults: totalResults,
            },
        };
    }

    /**
     * List students with pagination, filtering, and sorting
     */
    async listStudents(dto: ListStudentsDto) {
        const filters: StudentFilters = {};

        // Copy filters from DTO
        if (dto.graduateYearFrom) filters.graduateYearFrom = dto.graduateYearFrom;
        if (dto.graduateYearTo) filters.graduateYearTo = dto.graduateYearTo;
        if (dto.graduateGrade) filters.graduateGrade = dto.graduateGrade;
        if (dto.recruitmentTypeCode) filters.recruitmentTypeCode = dto.recruitmentTypeCode;
        if (dto.recruitmentUnitCode) filters.recruitmentUnitCode = dto.recruitmentUnitCode;
        if (dto.applicantScCode) filters.applicantScCode = dto.applicantScCode;
        if (dto.calculationStatus) filters.calculationStatus = dto.calculationStatus;

        const result = await this.studentRepository.listStudents(
            dto.recruitmentSeasonId,
            dto.page || 1,
            dto.pageSize || 10,
            dto.q,
            Object.keys(filters).length > 0 ? filters : undefined,
            dto.sort,
        );

        return {
            success: true,
            data: result,
        };
    }

    /**
     * Get detailed score calculation for a specific student
     */
    async getStudentDetail(dto: GetStudentDetailDto) {
        const student = await this.studentRepository.findByIdentifyNumber(dto.recruitmentSeasonId, dto.identifyNumber);

        if (!student) {
            return {
                success: false,
                error: 'Student not found',
            };
        }

        const subjectScoreIds = student.subjectScores.map(s => s.id);
        const details = await this.subjectDetailRepository.findBySubjectScoreIds(subjectScoreIds);

        const detailBySubjectId = new Map<number, SubjectScoreCalculationDetail>();
        details.forEach(d => detailBySubjectId.set(d.subjectScoreId, d));

        // Helper function to compute percentile
        const computePercentileFromSubject = (subject: {
            studentCount?: string | number | null;
            rank?: string | number | null;
            sameRank?: string | number | null;
        }): number | null => {
            const totalCount = Number(subject.studentCount);
            const rank = Number(subject.rank);
            const sameRank = subject.sameRank != null ? Number(subject.sameRank) : null;
            const percentage = ((totalCount + 1 - rank - ((sameRank ?? 1) - 1) / 2) / totalCount) * 100;
            return Math.round(percentage * 10) / 10;
        };

        const applicableSubjects = student.subjectScores
            .filter(s => detailBySubjectId.get(s.id)?.isReflected === true)
            .map(s => {
                const d = detailBySubjectId.get(s.id);
                return {
                    seqNumber: s.seqNumber,
                    subjectName: s.subjectName,
                    subjectCode: s.subjectCode,
                    subjectGroup: s.subjectGroup ?? null,
                    subjectSeparationCode: s.subjectSeparationCode,
                    rankingGrade: s.rankingGrade,
                    achievement: s.achievement,
                    assessment: s.assessment ?? null,
                    percentile: computePercentileFromSubject(s),
                    convertedScore: d?.convertedScore ?? null,
                    convertedBaseValue: d?.convertedBaseValue ?? null,
                    conversionFormula: d?.conversionFormula ?? null,
                    unit: s.unit,
                    grade: s.grade,
                    term: s.term,
                };
            });

        const excludedSubjects = student.subjectScores
            .filter(s => detailBySubjectId.get(s.id)?.isReflected === false)
            .map(s => {
                const d = detailBySubjectId.get(s.id);
                return {
                    seqNumber: s.seqNumber,
                    subjectName: s.subjectName,
                    subjectCode: s.subjectCode,
                    subjectGroup: s.subjectGroup ?? null,
                    subjectSeparationCode: s.subjectSeparationCode,
                    reason: d?.nonReflectionReason ?? '제외',
                    assessment: s.assessment ?? null,
                    percentile: computePercentileFromSubject(s),
                    convertedScore: d?.convertedScore ?? null,
                    convertedBaseValue: d?.convertedBaseValue ?? null,
                    conversionFormula: d?.conversionFormula ?? null,
                    unit: s.unit,
                    grade: s.grade,
                    term: s.term,
                };
            });

        const { finalFormula, examNumber } = await this.studentRepository.getStudentExtraInfo(student.id);

        return {
            success: true,
            data: {
                id: student.id,
                identifyNumber: student.identifyNumber,
                examNumber: examNumber ?? '',
                graduateYear: student.graduateYear,
                graduateGrade: student.graduateGrade,
                applicantScCode: student.applicantScCode,
                recruitmentTypeCode: student.recruitmentTypeCode,
                recruitmentUnitCode: student.recruitmentUnitCode,
                applicableSubjects,
                excludedSubjects,
                finalFormula: finalFormula ?? null,
            },
        };
    }

    /**
     * Export final scores to Excel
     */
    async exportScores(dto: ExportScoresDto): Promise<Buffer> {
        const rows = await this.studentRepository.exportFinalScores(dto.recruitmentSeasonId);

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

        return XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx',
        }) as Buffer;
    }
}
