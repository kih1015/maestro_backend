import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface BestSemesterAverageFinalScoreConfig {
    admissions: string[];
    units: string[];
    formula: (averageGrade: number) => number;
    roundDigits: number;
    seoilOption?: boolean;
}

export class BestSemesterAverageFinalScoreHandler extends BaseScoreHandler {
    protected readonly handlerType = 'BestSemesterAverageFinalScoreHandler';
    private readonly subject = '학기별 평균 최종 점수 계산';
    private readonly description = '선택된 학기들의 평균을 계산하고 공식을 적용하여 최종 점수를 산출합니다.';

    constructor(private readonly config: BestSemesterAverageFinalScoreConfig[]) {
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

        const reflectedSubjects = student.subjectScores.filter(
            s => s.calculationDetail && s.calculationDetail.isReflected,
        );

        if (reflectedSubjects.length === 0) {
            return;
        }

        // 학기별로 그룹화
        const semesterMap = new Map<string, typeof reflectedSubjects>();
        for (const s of reflectedSubjects) {
            const semesterKey = `${s.grade}-${s.term}`;
            if (!semesterMap.has(semesterKey)) {
                semesterMap.set(semesterKey, []);
            }
            semesterMap.get(semesterKey)!.push(s);
        }

        // 각 학기의 이수가중평균 계산
        const semesterAverages: number[] = [];
        for (const [, subjects] of semesterMap.entries()) {
            const totalWeightedScore = subjects.reduce(
                (acc, p) => acc + (p.calculationDetail?.convertedScore ?? 0) * this.parseUnit(p.unit),
                0,
            );
            const totalWeight = subjects.reduce((acc, p) => acc + this.parseUnit(p.unit), 0);
            const average = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
            semesterAverages.push(average);
        }

        // 학기들의 평균 계산 (총 석차 등급 비율)
        // 반영학기가 1개일 경우 나머지 학기는 기본점수 600(등급 9)으로 처리
        let totalAverageGrade = 0;
        if (semesterAverages.length === 1) {
            // 1개 학기만 있을 경우: (해당 학기 등급 + 9) / 2
            totalAverageGrade = (semesterAverages[0] + 9) / 2;
            if (config.seoilOption) {
                totalAverageGrade = semesterAverages[0];
            }
        } else if (semesterAverages.length > 1) {
            // 2개 이상 학기: 학기별 평균의 평균 계산
            totalAverageGrade = semesterAverages.reduce((acc, avg) => acc + avg, 0) / semesterAverages.length;
        }

        // 공식 적용: 600 + (50 × (9 - 등급 비율))
        const rawScore = config.formula(totalAverageGrade);

        // 소수점 반올림
        const finalScore = this.roundToDigits(rawScore, config.roundDigits);

        student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, undefined);
    }

    private parseUnit(unit?: string | null): number {
        const parsedUnit = parseFloat(unit ?? '');
        return Number.isFinite(parsedUnit) && parsedUnit > 0 ? parsedUnit : 1;
    }

    private roundToDigits(value: number, digits: number): number {
        const multiplier = Math.pow(10, digits);
        return Math.floor(Number(value.toPrecision(15)) * multiplier + 0.5) / multiplier;
    }

    private findConfig(admission: string, unit: string): BestSemesterAverageFinalScoreConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'calc',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
                formula: '600 + (50 × (9 - 등급 비율))',
                note: `반영학기 1개: (해당 학기 등급 + 9) / 2, 반영학기 2개 이상: 학기별 평균의 평균 계산, 소수점 ${c.roundDigits + 1}자리에서 반올림`,
            })),
        };
    }
}
