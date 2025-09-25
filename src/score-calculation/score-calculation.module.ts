import { Module } from '@nestjs/common';
import { ScoreCalculationController } from './score-calculation.controller';
import { StudentReadRepository } from './repositories/student-read.repository';
import { StudentScoreResultRepository } from './repositories/student-score-result.repository';
import { SubjectScoreCalculationDetailRepository } from './repositories/subject-score-calculation-detail.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';
import { ScoreCalculationUseCase } from './use-cases/score-calculation.use-case';
import { StudentQueryUseCase } from './use-cases/student-query.use-case';
import { ScoreExportUseCase } from './use-cases/score-export.use-case';
import { SummaryUseCase } from './use-cases/summary.use-case';
// Provider tokens for dependency injection
export const STUDENT_READ_REPOSITORY = 'STUDENT_READ_REPOSITORY';
export const STUDENT_SCORE_RESULT_REPOSITORY = 'STUDENT_SCORE_RESULT_REPOSITORY';
export const SUBJECT_SCORE_CALCULATION_DETAIL_REPOSITORY = 'SUBJECT_SCORE_CALCULATION_DETAIL_REPOSITORY';
export const STUDENT_COUNT_REPOSITORY = 'STUDENT_COUNT_REPOSITORY';
export const STUDENT_STREAM_REPOSITORY = 'STUDENT_STREAM_REPOSITORY';
export const STUDENT_QUERY_REPOSITORY = 'STUDENT_QUERY_REPOSITORY';
export const STUDENT_EXPORT_REPOSITORY = 'STUDENT_EXPORT_REPOSITORY';
export const SCORE_RESULT_WRITE_REPOSITORY = 'SCORE_RESULT_WRITE_REPOSITORY';
export const SUBJECT_DETAIL_WRITE_REPOSITORY = 'SUBJECT_DETAIL_WRITE_REPOSITORY';
export const SUBJECT_DETAIL_READ_REPOSITORY = 'SUBJECT_DETAIL_READ_REPOSITORY';

@Module({
    imports: [PrismaModule, EventsModule],
    controllers: [ScoreCalculationController],
    providers: [
        ScoreCalculationUseCase,
        StudentQueryUseCase,
        ScoreExportUseCase,
        SummaryUseCase,
        // Concrete repository implementations
        StudentReadRepository,
        StudentScoreResultRepository,
        SubjectScoreCalculationDetailRepository,
        // Interface providers
        {
            provide: STUDENT_COUNT_REPOSITORY,
            useClass: StudentReadRepository,
        },
        {
            provide: STUDENT_STREAM_REPOSITORY,
            useClass: StudentReadRepository,
        },
        {
            provide: STUDENT_QUERY_REPOSITORY,
            useClass: StudentReadRepository,
        },
        {
            provide: STUDENT_EXPORT_REPOSITORY,
            useClass: StudentReadRepository,
        },
        {
            provide: SCORE_RESULT_WRITE_REPOSITORY,
            useClass: StudentScoreResultRepository,
        },
        {
            provide: SUBJECT_DETAIL_WRITE_REPOSITORY,
            useClass: SubjectScoreCalculationDetailRepository,
        },
        {
            provide: SUBJECT_DETAIL_READ_REPOSITORY,
            useClass: SubjectScoreCalculationDetailRepository,
        },
        // Legacy tokens for backward compatibility
        {
            provide: STUDENT_READ_REPOSITORY,
            useClass: StudentReadRepository,
        },
        {
            provide: STUDENT_SCORE_RESULT_REPOSITORY,
            useClass: StudentScoreResultRepository,
        },
        {
            provide: SUBJECT_SCORE_CALCULATION_DETAIL_REPOSITORY,
            useClass: SubjectScoreCalculationDetailRepository,
        },
    ],
    exports: [ScoreCalculationUseCase, StudentQueryUseCase, ScoreExportUseCase, SummaryUseCase],
})
export class ScoreCalculationModule {}
