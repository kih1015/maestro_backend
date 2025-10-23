import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';

export interface RequiredSubjectGroupConfig {
    admissions: string[];
    units: string[];
    requiredSubjectGroups: string[];
}

/**
 * 필수 교과군 검증 핸들러
 * 반영교과군 중 하나라도 없으면 학생의 최종 점수를 0점 처리합니다.
 */
export class RequiredSubjectGroupHandler extends BaseScoreHandler {
    protected readonly handlerType = 'RequiredSubjectGroupHandler';
    private readonly subject = '필수 교과군 검증';
    private readonly description = '반영교과군 중 하나라도 없으면 0점 처리합니다.';

    constructor(
        private readonly config: RequiredSubjectGroupConfig[],
        private readonly admissionMapper: Record<string, string> = {},
        private readonly unitMapper: Record<string, string> = {},
    ) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        const requiredGroups = this.getRequiredSubjectGroups(type, unitCode);
        if (!requiredGroups || requiredGroups.length === 0) {
            return;
        }

        // 반영된 과목들 중에서 교과군 추출
        const reflectedSubjectGroups = new Set<string>();
        for (const s of student.subjectScores) {
            // 반영된 과목만 확인
            if (s.calculationDetail && s.calculationDetail.isReflected && s.subjectGroup) {
                reflectedSubjectGroups.add(s.subjectGroup);
            }
        }

        // 필수 교과군이 모두 있는지 확인
        const missingGroups: string[] = [];
        for (const requiredGroup of requiredGroups) {
            if (!reflectedSubjectGroups.has(requiredGroup)) {
                missingGroups.push(requiredGroup);
            }
        }

        // 하나라도 없으면 0점 처리
        if (missingGroups.length > 0) {
            context.shouldContinue = false;
            // 최종 점수를 0점으로 설정
            student.scoreResult = StudentScoreResult.create(
                student.id,
                0,
                0,
                `필수 교과군 미충족: ${missingGroups.join(', ')}`,
            );
        }
    }

    private getRequiredSubjectGroups(admission: string, unit: string): string[] | undefined {
        const config = this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
        return config ? config.requiredSubjectGroups : undefined;
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'filter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions.map(code => this.admissionMapper[code] || code),
                units: c.units.map(code => this.unitMapper[code] || code),
                includedGroup: c.requiredSubjectGroups,
            })),
        };
    }
}
