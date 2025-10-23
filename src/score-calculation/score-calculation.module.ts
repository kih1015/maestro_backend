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
import { CALCULATORS } from './calculator/calculator.tokens';
import { AdmissionsModule } from '../admissions/admissions.module';
import { GyeongbokCalculator } from './calculator/gyeongbok.calculator';
import { KyungheeCalculator } from './calculator/kyunghee.calculator';
import { KonkukCalculator } from './calculator/konkuk.calculator';
import { DankookCalculator } from './calculator/dankook.calculator';
import { DeoksungCalculator } from './calculator/deoksung.calculator';

@Module({
    imports: [PrismaModule, EventsModule, AdmissionsModule],
    controllers: [ScoreCalculationController],
    providers: [
        GacheonCalculator,
        GyeongbokCalculator,
        KyungheeCalculator,
        KonkukCalculator,
        DankookCalculator,
        DeoksungCalculator,
        {
            provide: CALCULATORS,
            useFactory: (
                gacheon: GacheonCalculator,
                gyeongbok: GyeongbokCalculator,
                kyunghee: KyungheeCalculator,
                konkuk: KonkukCalculator,
                dankook: DankookCalculator,
                deoksung: DeoksungCalculator,
            ) => [gacheon, gyeongbok, kyunghee, konkuk, dankook, deoksung],
            inject: [GacheonCalculator, GyeongbokCalculator, KyungheeCalculator, KonkukCalculator, DankookCalculator, DeoksungCalculator],
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
