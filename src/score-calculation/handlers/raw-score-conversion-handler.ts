import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface RawScoreConversionConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    rawScoreMapping: { min: number; score: number }[];
}

export class RawScoreConversionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'RawScoreConversionHandler';
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
                s.calculationDetail = SubjectScoreCalculationDetail.create(
                    s.id,
                    false,
                    '원점수 누락/범위 오류',
                    0,
                    this.handlerType,
                );
                continue;
            }

            const scoreMapping = config.rawScoreMapping.find(mapping => rawScore >= mapping.min);
            if (!scoreMapping) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(
                    s.id,
                    false,
                    '원점수 범위 오류',
                    0,
                    this.handlerType,
                );
                continue;
            }

            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                true,
                '',
                scoreMapping.score,
                this.handlerType,
            );
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
                mappingTable: c.rawScoreMapping.map(m => ({
                    key: `${m.min}점 이상`,
                    value: `${m.score}점`,
                })),
            })),
        };
    }
}
