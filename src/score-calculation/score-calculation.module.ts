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
import { GacheonCalculator } from './calculator/gacheon.calculator';

export const CALCULATORS = Symbol('CALCULATORS');

@Module({
    imports: [PrismaModule, EventsModule],
    controllers: [ScoreCalculationController],
    providers: [
        GacheonCalculator,
        {
            provide: CALCULATORS,
            useFactory: (gacheon: GacheonCalculator) => [gacheon],
            inject: [GacheonCalculator],
        },
        ScoreCalculationUseCase,
        StudentQueryUseCase,
        ScoreExportUseCase,
        SummaryUseCase,
        StudentReadRepository,
        StudentScoreResultRepository,
        SubjectScoreCalculationDetailRepository,
    ],
    exports: [ScoreCalculationUseCase, StudentQueryUseCase, ScoreExportUseCase, SummaryUseCase],
})
export class ScoreCalculationModule {}
