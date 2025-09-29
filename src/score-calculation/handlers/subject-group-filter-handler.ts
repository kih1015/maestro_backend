import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface SubjectConfig {
    admissions: string[];
    units: string[];
    reflectedSubjects: string[];
}

export class SubjectGroupFilterHandler extends BaseScoreHandler {
    constructor(private readonly config: SubjectConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        const allowedGroups = this.getReflectedSubjects(type, unitCode);
        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) continue;
            const group = s.subjectGroup ?? '';
            if (allowedGroups.indexOf(group) === -1) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, s, false, '비반영 교과군');
            }
        }
    }

    private getReflectedSubjects(admission: string, unit: string): string[] {
        const config = this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
        return config ? config.reflectedSubjects : [];
    }
}
