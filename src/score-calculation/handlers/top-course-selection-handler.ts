import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { Subject, SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface TopCourseSelectionConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[]; // 대상 과목 유형 (예: 진로선택 '02')
    topCourseCount: number; // 선택할 상위 과목 수 (예: 3)
}

/**
 * 특정 과목 유형에서 성적이 우수한 상위 N개 과목을 선택하는 핸들러
 *
 * 예: 경희대학교 진로선택과목 중 상위 3개 과목 선택
 */
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

        // 대상 과목 유형에 해당하고 반영되는 과목들만 추출
        const targetSubjects = student.subjectScores.filter(
            s =>
                s.calculationDetail?.isReflected &&
                config.subjectSeparations.includes(s.subjectSeparationCode || ''),
        );

        if (targetSubjects.length === 0) {
            return;
        }

        // 각 과목의 가중 평균 점수 계산 (변환점수 * 이수단위 / 이수단위)
        const courseScores: { subject: Subject; weightedScore: number }[] = targetSubjects.map(s => ({
            subject: s,
            weightedScore: s.calculationDetail?.convertedScore ?? 0,
        }));

        // 점수가 높은 순으로 정렬 (동점인 경우 이수단위가 큰 것 우선)
        courseScores.sort((a, b) => {
            if (a.weightedScore !== b.weightedScore) {
                return b.weightedScore - a.weightedScore; // 내림차순
            }
            return this.parseUnit(b.subject.unit) - this.parseUnit(a.subject.unit);
        });

        // 상위 N개 과목의 ID 저장
        const topCourseIds = new Set(
            courseScores.slice(0, config.topCourseCount).map(cs => cs.subject.id),
        );

        // 상위 N개가 아닌 과목들은 반영 제외
        for (const s of student.subjectScores) {
            if (!s.calculationDetail?.isReflected) {
                continue;
            }

            if (
                config.subjectSeparations.includes(s.subjectSeparationCode || '') &&
                !topCourseIds.has(s.id)
            ) {
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
