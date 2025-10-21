import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface SubjectSeparationConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
}

export class CourseGroupFilterHandler extends BaseScoreHandler {
    protected readonly handlerType = 'CourseGroupFilterHandler';
    private readonly subject = '교과 구분 필터';
    private readonly description = '교과 구분을 필터링합니다.';

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
                s.calculationDetail = SubjectScoreCalculationDetail.create(
                    s.id,
                    false,
                    '비반영 교과 구분',
                    undefined,
                    this.handlerType,
                );
            }
        }
    }

    private getReflectedCourseGroups(admission: string, unit: string): string[] {
        const config = this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
        return config ? config.subjectSeparations : [];
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'filter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions.map(code => GacheonConfig.ADMISSION_CODE_TO_NAME[code]),
                units: c.units.map(code => GacheonConfig.UNIT_CODE_TO_NAME[code]),
                includedGroup: c.subjectSeparations.map(code => GacheonConfig.SUBJECT_SEPARATION_CODE_TO_NAME[code]),
            })),
        };
    }
}
