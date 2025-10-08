import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';
import { GacheonConfig } from '../config/gacheon.config';

export interface SemesterReflectionConfig {
    admissions: string[];
    units: string[];
    maxGrade: number;
    maxTerm: number;
    excludeEarlyGraduateSecondGradeSecondTerm: boolean;
}

export class SemesterReflectionHandler extends BaseScoreHandler {
    protected readonly handlerType = 'SemesterReflectionHandler';
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
                undefined,
                this.handlerType,
            );
        }

        if (matchedConfig.excludeEarlyGraduateSecondGradeSecondTerm && student.graduateGrade === '2') {
            for (const s of student.subjectScores) {
                if (s.grade === 2 && s.term === 2) {
                    s.calculationDetail = SubjectScoreCalculationDetail.create(
                        s.id,
                        false,
                        '조기졸업자 2학년 2학기 미반영',
                        undefined,
                        this.handlerType,
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

    public getInfo(): HandlerInfo {
        return {
            type: 'filter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions.map(code => GacheonConfig.ADMISSION_CODE_TO_NAME[code]),
                units: c.units.map(code => GacheonConfig.UNIT_CODE_TO_NAME[code]),
                mappingTable: [
                    { key: '최대 학년', value: `${c.maxGrade}학년` },
                    { key: '최대 학기', value: `${c.maxTerm}학기` },
                    {
                        key: '조기졸업자 2학년 2학기 제외',
                        value: c.excludeEarlyGraduateSecondGradeSecondTerm ? '예' : '아니오',
                    },
                ],
            })),
        };
    }
}
