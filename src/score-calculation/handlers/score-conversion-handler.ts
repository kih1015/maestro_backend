import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface ConvertScoreInput {
    admission: string;
    unit: string;
    courseGroup: string;
    grade: number | null;
    rawScore: number | null;
}

export interface ConvertScoreResult {
    convertible: boolean;
    score: number;
    reason: string;
}

export interface ScoreConversionConfig {
    admissions: string[];
    units: string[];
    courseGroups?: string[];
    gradeMapping: { [grade: number]: number };
    rawScoreMapping?: { min: number; score: number }[];
}

export class ScoreConversionHandler extends BaseScoreHandler {
    constructor(private readonly config: ScoreConversionConfig[]) {
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
            const result = this.convertScore({
                admission: type,
                unit: unitCode,
                courseGroup: s.subjectSeparationCode ?? '',
                grade: s.rankingGrade ? Number(s.rankingGrade) : null,
                rawScore: Number(s.originalScore),
            });
            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                s,
                result.convertible,
                result.reason,
                result.score,
            );
        }
    }

    private convertScore(input: ConvertScoreInput): ConvertScoreResult {
        const { admission, unit, courseGroup, grade, rawScore } = input;

        // Find matching conversion config
        const config = this.config.find(
            config =>
                config.admissions.includes(admission) &&
                config.units.includes(unit) &&
                (!config.courseGroups || config.courseGroups.includes(courseGroup)),
        );

        if (!config) {
            return {
                convertible: false,
                score: 0,
                reason: '모집전형/모집단위 코드 미정의',
            };
        }

        // Handle raw score conversion (for 진로선택 subjects)
        if (config.rawScoreMapping) {
            if (!this.isValidRawScore(rawScore)) {
                return {
                    convertible: false,
                    score: 0,
                    reason: '원점수 누락/범위 오류',
                };
            }

            const scoreMapping = config.rawScoreMapping.find(mapping => rawScore >= mapping.min);
            if (!scoreMapping) {
                return {
                    convertible: false,
                    score: 0,
                    reason: '원점수 범위 오류',
                };
            }

            return {
                convertible: true,
                score: scoreMapping.score,
                reason: '',
            };
        }

        // Handle grade conversion
        if (!this.isValidGrade(grade)) {
            return {
                convertible: false,
                score: 0,
                reason: '등급 누락/범위 오류',
            };
        }

        const convertedScore = config.gradeMapping[grade];
        if (convertedScore === undefined) {
            return {
                convertible: false,
                score: 0,
                reason: '등급 변환 규칙 없음',
            };
        }

        return {
            convertible: true,
            score: convertedScore,
            reason: '',
        };
    }

    private isValidGrade(g?: number | null): g is number {
        return typeof g === 'number' && Number.isInteger(g) && g >= 1 && g <= 9;
    }

    private isValidRawScore(s?: number | null): s is number {
        return typeof s === 'number' && s >= 0 && s <= 100;
    }
}
