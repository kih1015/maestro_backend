import { Module } from '@nestjs/common';
import { ScoreCalculationController } from './score-calculation.controller';
import { ScoreCalculationService } from './score-calculation.service';
import { StudentReadRepository } from './repositories/student-read.repository';
import { StudentScoreResultRepository } from './repositories/student-score-result.repository';
import { SubjectScoreCalculationDetailRepository } from './repositories/subject-score-calculation-detail.repository';
import { PrismaModule } from '../prisma/prisma.module';

// Provider tokens for dependency injection
export const STUDENT_READ_REPOSITORY = 'STUDENT_READ_REPOSITORY';
export const STUDENT_SCORE_RESULT_REPOSITORY = 'STUDENT_SCORE_RESULT_REPOSITORY';
export const SUBJECT_SCORE_CALCULATION_DETAIL_REPOSITORY = 'SUBJECT_SCORE_CALCULATION_DETAIL_REPOSITORY';

@Module({
    imports: [PrismaModule],
    controllers: [ScoreCalculationController],
    providers: [
        ScoreCalculationService,
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
    exports: [ScoreCalculationService],
})
export class ScoreCalculationModule {}
