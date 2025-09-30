import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface SubjectSeparationConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
}

export class CourseGroupFilterHandler extends BaseScoreHandler {
    private readonly subject = '교과 편제 필터';
    private readonly description = '교과 편제를 필터링합니다.';

    constructor(private readonly config: SubjectSeparationConfig[]) {
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
                s.calculationDetail = SubjectScoreCalculationDetail.create(s.id, false, '비반영 교과 구분');
            }
        }
    }

    private getReflectedCourseGroups(admission: string, unit: string): string[] {
        const config = this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
        return config ? config.subjectSeparations : [];
    }
}
