import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { Subject, SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface BestSemesterSelectionConfig {
    admissions: string[];
    units: string[];
    bestSemesterCount: number; // 선택할 우수 학기 수 (예: 2)
}

export class BestSemesterSelectionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'BestSemesterSelectionHandler';
    private readonly subject = '우수 학기 선택';
    private readonly description = '5개 학기 중 우수 학기만 선택하여 반영합니다.';

    constructor(private readonly config: BestSemesterSelectionConfig[]) {
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

        const semesterMap = new Map<string, Subject[]>();
        for (const s of reflectedSubjects) {
            const semesterKey = `${s.grade}-${s.term}`;
            if (!semesterMap.has(semesterKey)) {
                semesterMap.set(semesterKey, []);
            }
            semesterMap.get(semesterKey)!.push(s);
        }

        const semesterAverages: { semester: string; average: number; totalWeight: number }[] = [];
        for (const [semester, subjects] of semesterMap.entries()) {
            const totalWeightedScore = subjects.reduce(
                (acc, p) => acc + (p.calculationDetail?.convertedScore ?? 0) * this.parseUnit(p.unit),
                0,
            );
            const totalWeight = subjects.reduce((acc, p) => acc + this.parseUnit(p.unit), 0);
            semesterAverages.push({
                semester,
                average: totalWeight > 0 ? totalWeightedScore / totalWeight : 0,
                totalWeight,
            });
        }
        if (student.identifyNumber === '10000063') {
            console.log(semesterAverages);
        }

        semesterAverages.sort((a, b) => {
            if (a.average !== b.average) {
                return a.average - b.average;
            }
            const [gradeA, termA] = a.semester.split('-');
            const [gradeB, termB] = b.semester.split('-');
            if (gradeA !== gradeB) {
                return parseInt(gradeA) - parseInt(gradeB);
            }
            return parseInt(termA) - parseInt(termB);
        });

        const bestSemesters = new Set(semesterAverages.slice(0, config.bestSemesterCount).map(s => s.semester));

        for (const s of student.subjectScores) {
            if (!s.calculationDetail || !s.calculationDetail.isReflected) {
                continue;
            }

            const semesterKey = `${s.grade}-${s.term}`;
            if (!bestSemesters.has(semesterKey)) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(
                    s.id,
                    false,
                    `우수 학기 미선택 (${config.bestSemesterCount}개 학기만 선택)`,
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

    private findConfig(admission: string, unit: string): BestSemesterSelectionConfig | undefined {
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
                note: `5개 학기 중 우수 ${c.bestSemesterCount}개 학기 선택`,
            })),
        };
    }
}
