import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { Subject, SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface TopCourseSelectionConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    topCourseCount: number;
}

export class TopCourseSelectionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'TopCourseSelectionHandler';
    private readonly subject = '상위 과목 선택';
    private readonly description = '특정 과목 유형에서 성적이 우수한 상위 N개 과목을 선택하여 반영합니다.';

    constructor(private readonly config: TopCourseSelectionConfig[]) {
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

        const targetSubjects = student.subjectScores.filter(
            s => s.calculationDetail?.isReflected && config.subjectSeparations.includes(s.subjectSeparationCode || ''),
        );

        if (targetSubjects.length === 0) {
            return;
        }

        const courseScores: { subject: Subject; weightedScore: number }[] = targetSubjects.map(s => ({
            subject: s,
            weightedScore: s.calculationDetail?.convertedScore ?? 0,
        }));

        courseScores.sort((a, b) => {
            if (a.weightedScore !== b.weightedScore) {
                return b.weightedScore - a.weightedScore; // 내림차순
            }
            if (b.subject.unit !== a.subject.unit) {
                return this.parseUnit(b.subject.unit) - this.parseUnit(a.subject.unit);
            }
            const ratioA = this.achievementARatio(a.subject.achievementRatio) || 100;
            const ratioB = this.achievementARatio(b.subject.achievementRatio) || 100;
            if (b.subject.achievementRatio) {
                return ratioA - ratioB;
            }
            const subjectGroupA = a.subject.subjectGroup ?? '';
            const subjectGroupB = b.subject.subjectGroup ?? '';
            if (subjectGroupA === '국어' && subjectGroupB !== '국어') return -1;
            if (subjectGroupA !== '국어' && subjectGroupB === '국어') return 1;

            return 0;
        });

        const topCourseIds = new Set(courseScores.slice(0, config.topCourseCount).map(cs => cs.subject.id));

        for (const s of student.subjectScores) {
            if (!s.calculationDetail?.isReflected) {
                continue;
            }

            if (config.subjectSeparations.includes(s.subjectSeparationCode || '') && !topCourseIds.has(s.id)) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(
                    s.id,
                    false,
                    `상위 ${config.topCourseCount}개 과목 미선택`,
                    0,
                    this.handlerType,
                );
            }
        }
    }

    private achievementARatio(achievementRatio: string | undefined): number {
        if (!achievementRatio) return 0;
        const match = achievementRatio.match(/A\(([\d.]+)\)/);
        return match ? Number(match[1]) : 0;
    }

    private parseUnit(unit?: string | null): number {
        const parsedUnit = parseFloat(unit ?? '');
        return Number.isFinite(parsedUnit) && parsedUnit > 0 ? parsedUnit : 1;
    }

    private findConfig(admission: string, unit: string): TopCourseSelectionConfig | undefined {
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
                note: `${c.subjectSeparations.join(', ')} 유형에서 상위 ${c.topCourseCount}개 과목 선택`,
            })),
        };
    }
}
