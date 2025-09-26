import { Module } from '@nestjs/common';
import { ScoreCalculationController } from './controllers/score-calculation.controller';
import { StudentReadRepository } from './repositories/student-read.repository';
import { StudentScoreResultRepository } from './repositories/student-score-result.repository';
import { SubjectScoreCalculationDetailRepository } from './repositories/subject-score-calculation-detail.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';
import { ScoreCalculationUseCase } from './services/score-calculation.use-case';
import { StudentQueryUseCase } from './services/student-query.use-case';
import { ScoreExportUseCase } from './services/score-export.use-case';
import { SummaryUseCase } from './services/summary.use-case';

// Provider tokens for dependency injection
export const STUDENT_READ_REPOSITORY = 'STUDENT_READ_REPOSITORY';
export const STUDENT_SCORE_RESULT_REPOSITORY = 'STUDENT_SCORE_RESULT_REPOSITORY';
export const SUBJECT_SCORE_CALCULATION_DETAIL_REPOSITORY = 'SUBJECT_SCORE_CALCULATION_DETAIL_REPOSITORY';

@Module({
    imports: [PrismaModule, EventsModule],
    controllers: [ScoreCalculationController],
    providers: [
        ScoreCalculationUseCase,
        StudentQueryUseCase,
        ScoreExportUseCase,
        SummaryUseCase,
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
        // Also provide the concrete classes for direct injection
        StudentReadRepository,
        StudentScoreResultRepository,
        SubjectScoreCalculationDetailRepository,
    ],
    exports: [ScoreCalculationUseCase, StudentQueryUseCase, ScoreExportUseCase, SummaryUseCase],
})
export class ScoreCalculationModule {}
