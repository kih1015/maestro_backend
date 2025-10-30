import { Calculator } from './calculator';
import { Student } from '../entities/student.entity';
import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from '../handlers/base-handler';
import { SemesterReflectionHandler } from '../handlers/semester-reflection-handler';
import { GradeConversionHandler } from '../handlers/grade-conversion-handler';
import { Injectable } from '@nestjs/common';
import { CalculatorEnum } from './calculator.enum';
import { SungsilConfig } from '../config/sungsil.config';
import { UnconvertedScoreFilterHandler } from '../handlers/unconverted-score-filter-handler';
import { SubjectGroupFilterHandler } from '../handlers/subject-group-filter-handler';
import { SubjectWeightedScoreHandler } from '../handlers/subject-weighted-score-handler';
import { CareerSubjectScoreHandler } from '../handlers/career-subject-score-handler';
import { SungsilFinalScoreHandler } from '../handlers/sungsil-final-score-handler';
import { StudentValidationHandlerV2 } from '../handlers/studnet-validation-handler-v2';
import { AchievementToGradeConversionHandler } from '../handlers/achievement-to-grade-conversion-handler';

@Injectable()
export class SungsilCalculator implements Calculator {
    private readonly type = CalculatorEnum.SUNGSIL;
    private readonly config = new SungsilConfig();
    private readonly handler: BaseScoreHandler;

    constructor() {
        const validationHandler = new StudentValidationHandlerV2(this.config.validationV2Config);
        const semesterHandler = new SemesterReflectionHandler(this.config.semesterReflectionConfig);
        const subjectGroupFilterHandler = new SubjectGroupFilterHandler(this.config.subjectGroupFilterConfig);
        const achievementToGradeHandler = new AchievementToGradeConversionHandler(
            this.config.achievementToGradeConversionConfig,
        );
        const gradeConversionHandler = new GradeConversionHandler(this.config.gradeConversionConfig);
        const unconvertedScoreFilterHandler = new UnconvertedScoreFilterHandler(
            this.config.unconvertedScoreFilterConfig,
        );
        const subjectWeightedScoreHandler = new SubjectWeightedScoreHandler(this.config.subjectWeightedScoreConfig);
        const careerSubjectScoreHandler = new CareerSubjectScoreHandler(this.config.careerSubjectScoreConfig);
        const sungsilFinalScoreHandler = new SungsilFinalScoreHandler(this.config.finalScoreConfig);

        // 핸들러 체이닝
        // 1. 검증 -> 2. 학기 반영 -> 3. 교과 필터링
        // 4. 성취도→등급 변환 (진로선택) -> 5. 등급→점수 변환 (모든 과목)
        // 6. 미변환 과목 필터링 -> 7. 가중평균 계산 -> 8. 진로선택 점수 계산 -> 9. 최종 점수
        validationHandler
            .setNext(semesterHandler)
            .setNext(subjectGroupFilterHandler)
            .setNext(achievementToGradeHandler)
            .setNext(gradeConversionHandler)
            .setNext(unconvertedScoreFilterHandler)
            .setNext(subjectWeightedScoreHandler)
            .setNext(careerSubjectScoreHandler)
            .setNext(sungsilFinalScoreHandler);

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
        return SungsilConfig.ADMISSION_CODE_TO_NAME;
    }

    getUnitMapper(): Record<string, string> {
        return SungsilConfig.UNIT_CODE_TO_NAME;
    }
}
