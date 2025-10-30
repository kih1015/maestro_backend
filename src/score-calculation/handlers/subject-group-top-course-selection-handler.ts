import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { Subject, SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface SubjectGroupTopCourseSelectionConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    subjectGroupRules: Array<{
        subjectGroups: string[]; // 교과 그룹 (예: ['국어', '수학'])
        topCourseCount: number; // 선택할 과목 수
        groupName: string; // 그룹 이름 (예: '국어 또는 수학')
    }>;
}

export class SubjectGroupTopCourseSelectionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'SubjectGroupTopCourseSelectionHandler';
    private readonly subject = '교과별 상위 과목 선택';
    private readonly description = '교과 그룹별로 성적이 우수한 상위 N개 과목을 선택하여 반영합니다.';

    constructor(private readonly config: SubjectGroupTopCourseSelectionConfig[]) {
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

        // 각 교과 그룹별로 상위 과목 선택
        for (const rule of config.subjectGroupRules) {
            this.selectTopCoursesForGroup(student, config, rule);
        }
    }

    private selectTopCoursesForGroup(
        student: any,
        config: SubjectGroupTopCourseSelectionConfig,
        rule: { subjectGroups: string[]; topCourseCount: number; groupName: string },
    ): void {
        // 해당 교과 그룹에 속하는 반영된 과목들 필터링
        const targetSubjects = student.subjectScores.filter(
            (s: Subject) =>
                s.calculationDetail?.isReflected &&
                config.subjectSeparations.includes(s.subjectSeparationCode || '') &&
                rule.subjectGroups.includes(s.subjectGroup || ''),
        );

        if (targetSubjects.length === 0) {
            return;
        }

        // 변환된 점수 기준으로 정렬
        const courseScores: { subject: Subject; weightedScore: number }[] = targetSubjects.map((s: Subject) => ({
            subject: s,
            weightedScore: s.calculationDetail?.convertedScore ?? 0,
        }));

        courseScores.sort((a, b) => {
            // 점수가 높은 순
            if (a.weightedScore !== b.weightedScore) {
                return b.weightedScore - a.weightedScore;
            }
            // 점수가 같으면 이수단위가 큰 순
            if (b.subject.unit !== a.subject.unit) {
                return this.parseUnit(b.subject.unit) - this.parseUnit(a.subject.unit);
            }
            // 이수단위도 같으면 성취도 A 비율이 낮은 순 (어려운 과목 우선)
            const ratioA = this.achievementARatio(a.subject.achievementRatio) || 100;
            const ratioB = this.achievementARatio(b.subject.achievementRatio) || 100;
            if (a.subject.achievementRatio && b.subject.achievementRatio) {
                return ratioA - ratioB;
            }
            return 0;
        });

        // 상위 N개 선택
        const topCourseIds = new Set(courseScores.slice(0, rule.topCourseCount).map(cs => cs.subject.id));

        // 선택되지 않은 과목은 미반영 처리
        for (const s of student.subjectScores) {
            if (!s.calculationDetail?.isReflected) {
                continue;
            }

            if (
                config.subjectSeparations.includes(s.subjectSeparationCode || '') &&
                rule.subjectGroups.includes(s.subjectGroup || '') &&
                !topCourseIds.has(s.id)
            ) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(
                    s.id,
                    false,
                    `${rule.groupName} 상위 ${rule.topCourseCount}개 과목 미선택`,
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

    private findConfig(admission: string, unit: string): SubjectGroupTopCourseSelectionConfig | undefined {
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
                formula: c.subjectGroupRules
                    .map(rule => `${rule.groupName}: 상위 ${rule.topCourseCount}개`)
                    .join(', '),
            })),
        };
    }
}
