import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { Subject, SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface BestSubjectSelectionConfig {
    admissions: string[];
    units: string[];
    bestSubjectCount: number; // 선택할 우수 교과 수 (예: 3)
}

export class BestSubjectSelectionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'BestSubjectSelectionHandler';
    private readonly subject = '우수 교과 선택';
    private readonly description = '우수 교과 전과목만 선택하여 반영합니다.';

    constructor(private readonly config: BestSubjectSelectionConfig[]) {
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

        const subjectGroupMap = new Map<string, Subject[]>();
        for (const s of reflectedSubjects) {
            const group = s.subjectGroup || s.subjectName;
            if (!subjectGroupMap.has(group)) {
                subjectGroupMap.set(group, []);
            }
            subjectGroupMap.get(group)!.push(s);
        }

        const subjectAverages: { subjectGroup: string; average: number; totalWeight: number }[] = [];
        for (const [subjectGroup, subjects] of subjectGroupMap.entries()) {
            const totalWeightedScore = subjects.reduce(
                (acc, p) => acc + (p.calculationDetail?.convertedScore ?? 0) * this.parseUnit(p.unit),
                0,
            );
            const totalWeight = subjects.reduce((acc, p) => acc + this.parseUnit(p.unit), 0);
            subjectAverages.push({
                subjectGroup,
                average: totalWeight > 0 ? totalWeightedScore / totalWeight : 0,
                totalWeight,
            });
        }

        subjectAverages.sort((a, b) => {
            if (a.average !== b.average) {
                return a.average - b.average;
            }
            return b.totalWeight - a.totalWeight;
        });

        const bestSubjects = new Set(subjectAverages.slice(0, config.bestSubjectCount).map(s => s.subjectGroup));

        for (const s of student.subjectScores) {
            if (!s.calculationDetail || !s.calculationDetail.isReflected) {
                continue;
            }

            const group = s.subjectGroup || s.subjectName;
            if (!bestSubjects.has(group)) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(
                    s.id,
                    false,
                    `우수 교과 미선택 (${config.bestSubjectCount}개 교과만 선택)`,
                    0,
                    this.handlerType,
                );
            }
        }
    }

    private parseUnit(unit?: string | null): number {
        const parsedUnit = parseFloat(unit ?? '');
        return Number.isFinite(parsedUnit) && parsedUnit > 0 ? parsedUnit : 1;
    }

    private findConfig(admission: string, unit: string): BestSubjectSelectionConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'filter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
                note: `우수 ${c.bestSubjectCount}개 교과 전과목 선택`,
            })),
        };
    }
}
