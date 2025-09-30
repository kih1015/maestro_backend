import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface RawScoreConversionConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    rawScoreMapping: { min: number; score: number }[];
}

export class RawScoreConversionHandler extends BaseScoreHandler {
    private readonly subject = '원점수 환산';
    private readonly description = '원점수를 기준 점수로 환산합니다.';

    constructor(private readonly config: RawScoreConversionConfig[]) {
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

            const config = this.findConfig(type, unitCode, s.subjectSeparationCode ?? '');
            if (!config) {
                continue;
            }

            const rawScore = Number(s.originalScore);
            if (!this.isValidRawScore(rawScore)) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, false, '원점수 누락/범위 오류', 0);
                continue;
            }

            const scoreMapping = config.rawScoreMapping.find(mapping => rawScore >= mapping.min);
            if (!scoreMapping) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, false, '원점수 범위 오류', 0);
                continue;
            }

            s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, true, '', scoreMapping.score);
        }
    }

    private findConfig(admission: string, unit: string, courseGroup: string): RawScoreConversionConfig | undefined {
        return this.config.find(
            config =>
                config.admissions.includes(admission) &&
                config.units.includes(unit) &&
                config.subjectSeparations.includes(courseGroup),
        );
    }

    private isValidRawScore(s?: number | null): s is number {
        return typeof s === 'number' && s >= 0 && s <= 100;
    }
}
