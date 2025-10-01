import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface GradeConversionConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    gradeMapping: { [grade: number]: number };
}

export class GradeConversionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'GradeConversionHandler';
    private readonly subject = '석차 등급 점수 환산';
    private readonly description = '석차 등급을 기준 점수로 환산합니다.';

    constructor(private readonly config: GradeConversionConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) {
                continue;
            }

            const config = this.findConfig(type, unitCode, s.subjectSeparationCode);
            if (!config) {
                continue;
            }

            const grade = s.rankingGrade ? Number(s.rankingGrade) : null;
            if (!this.isValidGrade(grade)) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, false, '등급 누락/범위 오류', 0, this.handlerType);
                continue;
            }

            const convertedScore = config.gradeMapping[grade];
            if (convertedScore === undefined) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, false, '등급 변환 규칙 없음', 0, this.handlerType);
                continue;
            }

            s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, true, '', convertedScore, this.handlerType);
        }
    }

    private findConfig(admission: string, unit: string, courseGroup: string): GradeConversionConfig | undefined {
        return this.config.find(
            config =>
                config.admissions.includes(admission) &&
                config.units.includes(unit) &&
                config.subjectSeparations.includes(courseGroup),
        );
    }

    private isValidGrade(g?: number | null): g is number {
        return typeof g === 'number' && Number.isInteger(g) && g >= 1 && g <= 9;
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'converter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions.map(code => GacheonConfig.ADMISSION_CODE_TO_NAME[code]),
                units: c.units.map(code => GacheonConfig.UNIT_CODE_TO_NAME[code]),
                includedGroup: c.subjectSeparations.map(code => GacheonConfig.SUBJECT_SEPARATION_CODE_TO_NAME[code]),
                mappingTable: Object.entries(c.gradeMapping).map(([key, value]) => ({
                    key: `${key}등급`,
                    value: `${value}점`,
                })),
            })),
        };
    }
}
