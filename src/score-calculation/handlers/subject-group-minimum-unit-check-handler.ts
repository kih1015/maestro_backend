import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface SubjectGroupMinimumUnitRule {
    subjectGroups: string[]; // 체크할 교과군 리스트 (예: ['국어', '영어'])
    subjectSeparations: string[];
    minimumUnit: number; // 최소 이수단위 (예: 12)
    defaultScore: number; // 미만일 경우 적용할 점수 (예: 86)
}

export interface SubjectGroupMinimumUnitCheckConfig {
    admissions: string[]; // 적용할 전형 코드 리스트
    units: string[]; // 적용할 모집단위 코드 리스트
    rules: SubjectGroupMinimumUnitRule[]; // 교과군별 규칙 리스트
}

/**
 * 교과군별 최소 이수단위 체크 핸들러
 *
 * 특정 교과군의 총 이수단위가 최소 단위 미만이면 해당 교과군의 점수를 고정값으로 환산
 *
 * @example
 * // 국어, 영어 교과군의 이수단위가 12단위 미만이면 86점으로 고정
 * const config = {
 *   admissions: ['기회균형전형I_사회통합'],
 *   units: ['ALL'],
 *   rules: [
 *     {
 *       subjectGroups: ['국어', '영어'],
 *       minimumUnit: 12,
 *       defaultScore: 86
 *     }
 *   ]
 * };
 */
export class SubjectGroupMinimumUnitCheckHandler extends BaseScoreHandler {
    protected readonly handlerType = 'SubjectGroupMinimumUnitCheckHandler';
    private readonly subject = '교과군별 최소 이수단위 체크';
    private readonly description =
        '특정 교과군의 이수단위가 최소값 미만이면 해당 교과군의 점수를 고정값으로 환산합니다.';

    constructor(private readonly config: SubjectGroupMinimumUnitCheckConfig[]) {
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

        // 각 규칙별로 처리
        for (const rule of config.rules) {
            this.applyRule(context, rule);
        }
    }

    private applyRule(context: ScoreCalculationContext, rule: SubjectGroupMinimumUnitRule): void {
        const student = context.student;

        // 해당 교과군에 속하고 반영된 과목들 필터링
        const targetSubjects = student.subjectScores.filter(
            s =>
                s.calculationDetail?.isReflected &&
                s.subjectGroup &&
                rule.subjectGroups.includes(s.subjectGroup) &&
                rule.subjectSeparations.includes(s.subjectSeparationCode),
        );

        // 총 이수단위 계산
        const totalUnit = targetSubjects.reduce((acc, s) => acc + this.parseUnit(s.unit), 0);

        // 이수단위가 최소 단위 미만이면 해당 교과군 과목들의 점수를 고정값으로 환산
        if (totalUnit < rule.minimumUnit) {
            for (const s of student.subjectScores) {
                if (
                    rule.subjectGroups.includes(s.subjectGroup ?? '') &&
                    s.calculationDetail &&
                    rule.subjectSeparations.includes(s.subjectSeparationCode ?? '')
                ) {
                    s.calculationDetail.convertedScore = rule.defaultScore;
                    s.calculationDetail.convertedBaseValue = 'GRADE';
                }
            }
        }
    }

    private parseUnit(unit?: string | null): number {
        const parsedUnit = parseFloat(unit ?? '');
        return Number.isFinite(parsedUnit) && parsedUnit > 0 ? parsedUnit : 1;
    }

    private findConfig(admission: string, unit: string): SubjectGroupMinimumUnitCheckConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'converter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
            })),
        };
    }
}
