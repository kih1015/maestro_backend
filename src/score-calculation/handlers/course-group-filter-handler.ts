import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface CourseGroupConfig {
    admissions: string[];
    units: string[];
    reflectedCourseGroups: string[];
}

export class CourseGroupFilterHandler extends BaseScoreHandler {
    constructor(private readonly config: CourseGroupConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        const reflectedCourseGroups = this.getReflectedCourseGroups(type, unitCode);
        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) continue;
            const sep = s.subjectSeparationCode ?? '';
            if (!reflectedCourseGroups.includes(sep)) {
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, s, false, '비반영 교과 구분');
            }
        }
    }

    private getReflectedCourseGroups(admission: string, unit: string): string[] {
        const config = this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
        return config ? config.reflectedCourseGroups : [];
    }
}
