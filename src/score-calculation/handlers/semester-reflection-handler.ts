import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface SemesterReflectionConfig {
    admissions: string[];
    units: string[];
    maxGrade: number;
    maxTerm: number;
    excludeEarlyGraduateSecondGradeSecondTerm: boolean;
}

export class SemesterReflectionHandler extends BaseScoreHandler {
    private readonly subject = '반영 학기 필터';
    private readonly description = '특정 학기를 필터링합니다.';

    constructor(private readonly config: SemesterReflectionConfig[]) {
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
            const include = this.isWithinSemesterLimit(s.grade, s.term, matchedConfig.maxGrade, matchedConfig.maxTerm);
            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                include,
                include ? null : `${matchedConfig.maxGrade}학년 ${matchedConfig.maxTerm}학기 초과 미반영`,
            );
        }

        if (matchedConfig.excludeEarlyGraduateSecondGradeSecondTerm && student.graduateGrade === '2') {
            for (const s of student.subjectScores) {
                if (s.grade === 2 && s.term === 2) {
                    s.calculationDetail = SubjectScoreCalculationDetail.create(
                        s.id,
                        false,
                        '조기졸업자 2학년 2학기 미반영',
                    );
                }
            }
        }
    }

    private isWithinSemesterLimit(grade: number, term: number, maxGrade: number, maxTerm: number): boolean {
        if (grade < maxGrade) return true;
        return grade === maxGrade && term <= maxTerm;
    }

    private findMatchingConfig(admission: string, unit: string): SemesterReflectionConfig | undefined {
        return this.config.find(cfg => cfg.admissions.includes(admission) && cfg.units.includes(unit));
    }
}
