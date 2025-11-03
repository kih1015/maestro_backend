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
import { MyongjiCalculator } from './calculator/myongji.calculator';
import { PusanCalculator } from './calculator/pusan.calculator';
import { SamyookCalculator } from './calculator/samyook.calculator';
import { SamyookHealthCalculator } from './calculator/samyook-health.calculator';
import { SeoultechCalculator } from './calculator/seoultech.calculator';
import { SeoilCalculator } from './calculator/seoil.calculator';
import { SungkyulCalculator } from './calculator/sungkyul.calculator';
import { SeonggonghouiCalculator } from './calculator/seonggonghoui.calculator';
import { SungsilCalculator } from './calculator/sungsil.calculator';
import { SoonguiCalculator } from './calculator/soongui.calculator';
import { ShinhanCalculator } from './calculator/shinhan.calculator';
import { YonseiCalculator } from './calculator/yonsei.calculator';

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
        MyongjiCalculator,
        PusanCalculator,
        SamyookCalculator,
        SamyookHealthCalculator,
        SeoultechCalculator,
        SeoilCalculator,
        SungkyulCalculator,
        SeonggonghouiCalculator,
        SungsilCalculator,
        SoonguiCalculator,
        ShinhanCalculator,
        YonseiCalculator,
        {
            provide: CALCULATORS,
            useFactory: (
                gacheon: GacheonCalculator,
                gyeongbok: GyeongbokCalculator,
                kyunghee: KyungheeCalculator,
                konkuk: KonkukCalculator,
                dankook: DankookCalculator,
                deoksung: DeoksungCalculator,
                myongji: MyongjiCalculator,
                pusan: PusanCalculator,
                samyook: SamyookCalculator,
                samyookHealth: SamyookHealthCalculator,
                seoultech: SeoultechCalculator,
                seoil: SeoilCalculator,
                sungkyul: SungkyulCalculator,
                seonggonghoui: SeonggonghouiCalculator,
                sungsil: SungsilCalculator,
                soongui: SoonguiCalculator,
                shinhan: ShinhanCalculator,
                yonsei: YonseiCalculator,
            ) => [
                gacheon,
                gyeongbok,
                kyunghee,
                konkuk,
                dankook,
                deoksung,
                myongji,
                pusan,
                samyook,
                samyookHealth,
                seoultech,
                seoil,
                sungkyul,
                seonggonghoui,
                sungsil,
                soongui,
                shinhan,
                yonsei,
            ],
            inject: [
                GacheonCalculator,
                GyeongbokCalculator,
                KyungheeCalculator,
                KonkukCalculator,
                DankookCalculator,
                DeoksungCalculator,
                MyongjiCalculator,
                PusanCalculator,
                SamyookCalculator,
                SamyookHealthCalculator,
                SeoultechCalculator,
                SeoilCalculator,
                SungkyulCalculator,
                SeonggonghouiCalculator,
                SungsilCalculator,
                SoonguiCalculator,
                ShinhanCalculator,
                YonseiCalculator,
            ],
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
