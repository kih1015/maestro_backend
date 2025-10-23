import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';

export interface DeoksungMinimumUnitCheckConfig {
    admissions: string[]; // 기회균형전형I_사회통합
    units: string[];
    minimumUnit: number; // 12
    defaultScore: number; // 86
}

/**
 * 덕성여대 최소 이수단위 체크 핸들러
 * 기회균형전형I_사회통합: 공통/일반선택 총 이수단위가 12단위 미만이면 일반평균을 86점으로 고정
 */
export class DeoksungMinimumUnitCheckHandler extends BaseScoreHandler {
    protected readonly handlerType = 'DeoksungMinimumUnitCheckHandler';
    private readonly subject = '최소 이수단위 체크';
    private readonly description = '기회균형전형에서 공통/일반선택 이수단위가 12단위 미만이면 86점으로 고정합니다.';

    constructor(private readonly config: DeoksungMinimumUnitCheckConfig[]) {
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

        // 공통 및 일반선택 과목 필터링
        const commonGeneralSubjects = student.subjectScores.filter(
            s =>
                s.calculationDetail?.isReflected &&
                (s.subjectSeparationCode === '01' || s.subjectSeparationCode === '02'),
        );

        // 총 이수단위 계산
        const totalUnit = commonGeneralSubjects.reduce((acc, s) => acc + this.parseUnit(s.unit), 0);

        // 이수단위가 최소 단위 미만이면 모든 공통/일반선택 과목의 점수를 86점으로 고정
        if (totalUnit < config.minimumUnit) {
            for (const s of commonGeneralSubjects) {
                if (s.calculationDetail) {
                    s.calculationDetail.convertedScore = config.defaultScore;
                    s.calculationDetail.convertedBaseValue = 'GRADE';
                }
            }

            // metadata에 저장
            if (!context.metadata) {
                context.metadata = {};
            }
            context.metadata.minimumUnitApplied = true;
        }
    }

    private parseUnit(unit?: string | null): number {
        const parsedUnit = parseFloat(unit ?? '');
        return Number.isFinite(parsedUnit) && parsedUnit > 0 ? parsedUnit : 1;
    }

    private findConfig(admission: string, unit: string): DeoksungMinimumUnitCheckConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission));
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
