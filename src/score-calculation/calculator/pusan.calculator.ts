import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { PusanConfig } from '../config/pusan.config';
import { GCNValidationHandler } from '../handlers/gcn-validation-handler';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { FinalScoreCalculationHandler } from '../handlers/final-score-calculation-handler';
import { WeightApplyHandler } from '../handlers/weight-apply-handler';
import { FinalScoreFloorHandler } from '../handlers/final-score-floor-handler';
import { ZScoreGradeConversionHandler } from '../handlers/zscore-grade-conversion-handler';

@Injectable()
export class PusanCalculator implements Calculator {
    private readonly type = CalculatorEnum.PUSAN;
    private readonly config = new PusanConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new GCNValidationHandler(this.config.validationConfig);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupHandler = new SubjectGroupFilterHandler(this.config.subjectConfigs);

        // 일반 과목: 석차등급 -> 점수 변환
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);

        // 전문교과: Z점수 -> 등급 변환 (특성화고교만)
        const zScoreGradeConversionHandler = new ZScoreGradeConversionHandler(this.config.zScoreGradeConfig);

        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );

        // 최종 점수 계산 (가중평균)
        const finalScoreHandler = new FinalScoreCalculationHandler(this.config.finalScoreConfig);

        // 전형별 교과배점 적용
        const weightApplyHandler = new WeightApplyHandler(this.config.weightApplyConfig);

        // 소수점 버림 처리
        const finalScoreFloorHandler1 = new FinalScoreFloorHandler(this.config.finalScoreFloorConfig);
        const finalScoreFloorHandler2 = new FinalScoreFloorHandler(this.config.finalScoreFloorConfig);

        // 핸들러 체이닝
        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupHandler)
            .setNext(gradeConversionHandler)
            .setNext(zScoreGradeConversionHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(finalScoreHandler)
            .setNext(finalScoreFloorHandler1)
            .setNext(weightApplyHandler)
            .setNext(finalScoreFloorHandler2);

        this.handler = validationHandler;
    }

    support(calculatorType: CalculatorEnum): boolean {
        return calculatorType === this.type;
    }

    calculate(student: Student): void {
        const context: ScoreCalculationContext = {
            student: student,
            shouldContinue: true,
        };

        this.handler.handle(context);
    }

    getCalculatorInfo(): HandlerInfo[] {
        return this.handler.listInfo();
    }

    getAdmissionMapper(): Record<string, string> {
        return PusanConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return PusanConfig.UNIT_CODE_TO_NAME;
    }
}
