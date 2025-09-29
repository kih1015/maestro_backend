import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface ExcludedSubjectConfig {
    readonly commonExcludedSubjects: string[];
    readonly exclusionAdmissionCode: string;
}

export class ExcludedSubjectHandler extends BaseScoreHandler {
    constructor(private readonly config: ExcludedSubjectConfig) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;

        if (this.shouldExcludeCommonSubjects(type)) {
            for (const s of student.subjectScores) {
                if (s.calculationDetail && !s.calculationDetail.isReflected) {
                    continue;
                }
                if (this.isExcludedSubject(s.subjectName)) {
                    s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, false, '특정 공통 과목 미반영');
                }
            }
        }
    }

    private shouldExcludeCommonSubjects(admission: string): boolean {
        return admission === this.config.exclusionAdmissionCode;
    }

    private isExcludedSubject(subjectName: string): boolean {
        return this.config.commonExcludedSubjects.includes(subjectName);
    }
}
