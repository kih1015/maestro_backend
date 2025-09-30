import { BaseScoreHandler, ScoreCalculationContext } from './base-handler';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';

export class SemesterReflectionHandler extends BaseScoreHandler {
    private readonly subject = '반영 학기 필터';
    private readonly description = '특정 학기를 필터링합니다.';

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;

        for (const s of student.subjectScores) {
            const include = this.isUpToThirdFirstSemester(s.grade, s.term);
            s.calculationDetail = SubjectScoreCalculationDetail.create(
                s.id,
                include,
                include ? null : '3학년 2학기 미반영',
            );
        }

        if (student.graduateGrade === '2') {
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

    private isUpToThirdFirstSemester(grade: number, term: number): boolean {
        if (grade < 3) return true;
        return grade === 3 && term === 1;
    }
}
