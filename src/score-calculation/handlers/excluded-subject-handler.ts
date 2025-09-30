import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface ExcludedSubjectConfig {
    admissions: string[];
    units: string[];
    commonExcludedSubjects: string[];
}

export class ExcludedSubjectHandler extends BaseScoreHandler {
    constructor(private readonly config: ExcludedSubjectConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unit = student.recruitmentUnitCode;

        const matchedConfig = this.findMatchingConfig(type, unit);
        if (!matchedConfig) {
            return;
        }

        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) {
                continue;
            }
            if (this.isExcludedSubject(s.subjectName, matchedConfig)) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, false, '특정 공통 과목 미반영');
            }
        }
    }

    private findMatchingConfig(admission: string, unit: string): ExcludedSubjectConfig | undefined {
        return this.config.find(cfg => cfg.admissions.includes(admission) && cfg.units.includes(unit));
    }

    private isExcludedSubject(subjectName: string, config: ExcludedSubjectConfig): boolean {
        return config.commonExcludedSubjects.includes(subjectName);
    }
}
