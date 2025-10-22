import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult } from '../entities/student.entity';
import { KyungheeConfig } from '../config/kyunghee.config';

export interface GraduationEligibilityConfig {
    readonly admissions: string[];
    readonly units: string[];
    readonly minGraduateYear: string | null;
    readonly maxGraduateYear: string | null;
    readonly requireSpecializedSchool?: boolean; // true인 경우 specializedSchoolYN='Y'인 학생만 해당
}

export class GraduationEligibilityHandler extends BaseScoreHandler {
    protected readonly handlerType = 'GraduationEligibilityHandler';
    private readonly subject = '성적 반영대상 필터';
    private readonly description = '졸업년도 및 지원자 구분에 따라 성적 반영대상을 필터링합니다.';

    constructor(private readonly config: GraduationEligibilityConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const admission = student.recruitmentTypeCode;
        const unit = student.recruitmentUnitCode;
        const graduateYear = student.graduateYear;
        const isSpecializedSchool = student.specializedSchoolYN === 'Y';

        // 매칭되는 설정 찾기
        const matchedConfig = this.findMatchingConfig(admission, unit, isSpecializedSchool);

        if (!matchedConfig) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '성적 반영대상 아님');
            context.shouldContinue = false;
            return;
        }

        // 졸업년도 제한이 없으면 통과
        if (matchedConfig.minGraduateYear === null && matchedConfig.maxGraduateYear === null) {
            return;
        }

        // 졸업년도 검증
        if (!this.isValidGraduateYear(graduateYear, matchedConfig)) {
            const minYear = matchedConfig.minGraduateYear ? this.formatGraduateYear(matchedConfig.minGraduateYear) : '';
            const maxYear = matchedConfig.maxGraduateYear ? this.formatGraduateYear(matchedConfig.maxGraduateYear) : '';

            let reason = '성적 반영대상 졸업년도 미충족';
            if (minYear && maxYear) {
                reason = `${minYear} ~ ${maxYear} 졸업(예정)자만 반영`;
            } else if (minYear) {
                reason = `${minYear} 이후 졸업(예정)자만 반영`;
            } else if (maxYear) {
                reason = `${maxYear} 이전 졸업(예정)자만 반영`;
            }

            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, reason);
            context.shouldContinue = false;
        }
    }

    private findMatchingConfig(
        admission: string,
        unit: string,
        isSpecializedSchool: boolean,
    ): GraduationEligibilityConfig | undefined {
        // requireSpecializedSchool이 true인 설정부터 우선 매칭 (더 구체적인 조건)
        const specificMatch = this.config.find(
            cfg =>
                cfg.admissions.includes(admission) &&
                cfg.units.includes(unit) &&
                cfg.requireSpecializedSchool === true &&
                isSpecializedSchool,
        );

        if (specificMatch) {
            return specificMatch;
        }

        // requireSpecializedSchool이 없거나 false인 일반 설정 매칭
        return this.config.find(
            cfg =>
                cfg.admissions.includes(admission) &&
                cfg.units.includes(unit) &&
                (cfg.requireSpecializedSchool === undefined || !cfg.requireSpecializedSchool),
        );
    }

    private isValidGraduateYear(graduateYear: string, config: GraduationEligibilityConfig): boolean {
        if (config.minGraduateYear && graduateYear < config.minGraduateYear) {
            return false;
        }

        return !(config.maxGraduateYear && graduateYear > config.maxGraduateYear);
    }

    private formatGraduateYear(graduateYear: string): string {
        // "2024" -> "2024년"
        return `${graduateYear}년`;
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'filter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions.map(code => KyungheeConfig.ADMISSION_CODE_TO_NAME[code] || code),
                units: c.units.map(code => KyungheeConfig.UNIT_CODE_TO_NAME[code] || code),
                mappingTable: [
                    {
                        key: '최소 졸업년도',
                        value: c.minGraduateYear ? this.formatGraduateYear(c.minGraduateYear) : '제한 없음',
                    },
                    {
                        key: '최대 졸업년도',
                        value: c.maxGraduateYear ? this.formatGraduateYear(c.maxGraduateYear) : '제한 없음',
                    },
                    {
                        key: '특성화고 여부',
                        value: c.requireSpecializedSchool ? '특성화고만 해당' : '모든 학교',
                    },
                ],
            })),
        };
    }
}
