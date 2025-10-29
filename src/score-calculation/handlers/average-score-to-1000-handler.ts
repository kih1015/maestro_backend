import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface AverageScoreTo1000Config {
    admissions: string[];
    units: string[];
}

export class AverageScoreTo1000Handler extends BaseScoreHandler {
    protected readonly handlerType = 'AverageScoreTo1000Handler';
    private readonly subject = '평균 점수 1000점 만점 환산';
    private readonly description = '석차등급환산 평균점수를 1000점 만점으로 환산합니다.';

    // 석차등급환산 평균점수 기준득점표
    private readonly scoreTable: Array<{ min: number; max: number; score: number }> = [
        { min: 4.91, max: 5.0, score: 1000 },
        { min: 4.81, max: 4.9, score: 997 },
        { min: 4.71, max: 4.8, score: 994 },
        { min: 4.61, max: 4.7, score: 991 },
        { min: 4.51, max: 4.6, score: 988 },
        { min: 4.41, max: 4.5, score: 985 },
        { min: 4.31, max: 4.4, score: 982 },
        { min: 4.21, max: 4.3, score: 979 },
        { min: 4.11, max: 4.2, score: 976 },
        { min: 4.01, max: 4.1, score: 973 },
        { min: 3.91, max: 4.0, score: 970 },
        { min: 3.81, max: 3.9, score: 967 },
        { min: 3.71, max: 3.8, score: 964 },
        { min: 3.61, max: 3.7, score: 961 },
        { min: 3.51, max: 3.6, score: 958 },
        { min: 3.41, max: 3.5, score: 955 },
        { min: 3.31, max: 3.4, score: 952 },
        { min: 3.21, max: 3.3, score: 949 },
        { min: 3.11, max: 3.2, score: 946 },
        { min: 3.01, max: 3.1, score: 943 },
        { min: 2.91, max: 3.0, score: 940 },
        { min: 2.81, max: 2.9, score: 937 },
        { min: 2.71, max: 2.8, score: 934 },
        { min: 2.61, max: 2.7, score: 931 },
        { min: 2.51, max: 2.6, score: 928 },
        { min: 2.41, max: 2.5, score: 925 },
        { min: 2.31, max: 2.4, score: 922 },
        { min: 2.21, max: 2.3, score: 919 },
        { min: 2.11, max: 2.2, score: 916 },
        { min: 2.01, max: 2.1, score: 913 },
        { min: 1.91, max: 2.0, score: 910 },
        { min: 1.81, max: 1.9, score: 830 },
        { min: 1.71, max: 1.8, score: 750 },
        { min: 1.61, max: 1.7, score: 670 },
        { min: 1.51, max: 1.6, score: 590 },
        { min: 1.41, max: 1.5, score: 510 },
        { min: 1.31, max: 1.4, score: 408 },
        { min: 1.21, max: 1.3, score: 306 },
        { min: 1.11, max: 1.2, score: 204 },
        { min: 1.01, max: 1.1, score: 102 },
        { min: 1.0, max: 1.0, score: 0 },
    ];

    constructor(private readonly config: AverageScoreTo1000Config[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        const config = this.findConfig(type, unitCode);
        if (!config) {
            return;
        }

        if (!student.scoreResult) {
            return;
        }

        const averageScore = student.scoreResult.finalScore;

        if (!this.isValidScore(averageScore)) {
            student.scoreResult.finalScore = 0;
            return;
        }

        // 변환표에서 해당하는 점수 찾기
        const convertedScore = this.convertScore(averageScore);
        student.scoreResult.finalScore = convertedScore;
    }

    private convertScore(averageScore: number): number {
        // 5.0 초과는 1000점
        if (averageScore > 5.0) {
            return 1000;
        }

        // 1.0 미만은 0점
        if (averageScore < 1.0) {
            return 0;
        }

        // 변환표에서 해당 구간 찾기
        for (const range of this.scoreTable) {
            if (averageScore >= range.min && averageScore <= range.max) {
                return range.score;
            }
        }

        // 찾지 못한 경우 0점 (안전장치)
        return 0;
    }

    private isValidScore(score: number | null): score is number {
        return typeof score === 'number' && !isNaN(score) && score >= 0;
    }

    private findConfig(admission: string, unit: string): AverageScoreTo1000Config | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        // 변환 테이블을 표시용으로 정리
        const mappingTable = this.scoreTable.map(range => {
            if (range.min === range.max) {
                return {
                    key: `${range.min.toFixed(2)}`,
                    value: `${range.score}점`,
                };
            }
            return {
                key: `${range.min.toFixed(2)} ~ ${range.max.toFixed(2)}`,
                value: `${range.score}점`,
            };
        });

        return {
            type: 'converter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
                mappingTable: mappingTable,
            })),
        };
    }
}
