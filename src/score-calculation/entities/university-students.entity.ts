import { Student, Subject, StudentScoreResult, SubjectScoreCalculationDetail } from './student.entity';

/**
 * Base class for university-specific calculation logic
 */
export abstract class UniversityStudent extends Student {
    abstract calculate(): void;

    protected computePercentileFromSubject(subject: Subject): number | null {
        const totalCount = Number(subject.studentCount);
        const rank = Number(subject.rank);
        const sameRank = subject.sameRank != null ? Number(subject.sameRank) : null;
        const percentage = ((totalCount + 1 - rank - ((sameRank ?? 1) - 1) / 2) / totalCount) * 100;
        return Math.round(percentage * 10) / 10;
    }
}

/**
 * 가천대학교 점수 계산 로직
 */
export class GCNStudent extends UniversityStudent {
    calculate(): void {
        // Implement Gachon University specific calculation logic
        let totalScore = 0;
        let subjectCount = 0;
        const details: SubjectScoreCalculationDetail[] = [];

        for (const subject of this.subjectScores) {
            const percentile = this.computePercentileFromSubject(subject);

            // Example calculation logic for GCN
            if (this.shouldIncludeSubject(subject)) {
                const convertedScore = this.convertScore(percentile || 0);
                totalScore += convertedScore;
                subjectCount++;

                subject.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: subject.id,
                    isReflected: true,
                    convertedScore,
                    convertedBaseValue: 'PERCENTILE',
                    conversionFormula: `percentile * 0.9`,
                });
            } else {
                subject.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: subject.id,
                    isReflected: false,
                    nonReflectionReason: '예체능 과목 제외',
                });
            }

            details.push(subject.calculationDetail);
        }

        const finalScore = subjectCount > 0 ? totalScore / subjectCount : 0;
        this.scoreResult = new StudentScoreResult(this.id, 0, finalScore);
    }

    private shouldIncludeSubject(subject: Subject): boolean {
        // Exclude arts and physical education subjects
        const excludedGroups = ['예체능', '체육', '음악', '미술'];
        return !excludedGroups.includes(subject.subjectGroup || '');
    }

    private convertScore(percentile: number): number {
        return percentile * 0.9; // Example conversion formula
    }
}

/**
 * 한양대학교 점수 계산 로직
 */
export class HBWStudent extends UniversityStudent {
    calculate(): void {
        // Implement Hanyang University specific calculation logic
        let totalScore = 0;
        let totalUnits = 0;
        const details: SubjectScoreCalculationDetail[] = [];

        for (const subject of this.subjectScores) {
            const percentile = this.computePercentileFromSubject(subject);

            if (this.shouldIncludeSubject(subject)) {
                const convertedScore = this.convertScore(percentile || 0);
                const units = Number(subject.unit);
                totalScore += convertedScore * units;
                totalUnits += units;

                subject.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: subject.id,
                    isReflected: true,
                    convertedScore,
                    convertedBaseValue: 'PERCENTILE',
                    conversionFormula: `percentile * 0.85 (weighted by ${units} units)`,
                });
            } else {
                subject.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: subject.id,
                    isReflected: false,
                    nonReflectionReason: '선택 과목 제외',
                });
            }

            details.push(subject.calculationDetail);
        }

        const finalScore = totalUnits > 0 ? totalScore / totalUnits : 0;
        this.scoreResult = new StudentScoreResult(this.id, 0, finalScore);
    }

    private shouldIncludeSubject(subject: Subject): boolean {
        // Include only core subjects for HBW
        const coreSubjects = ['국어', '영어', '수학', '과학', '사회'];
        return coreSubjects.includes(subject.subjectGroup || '');
    }

    private convertScore(percentile: number): number {
        return percentile * 0.85; // Example conversion formula for HBW
    }
}

/**
 * 숙명여자대학교 점수 계산 로직
 */
export class SMWUStudent extends UniversityStudent {
    calculate(): void {
        // Implement Sookmyung Women's University specific calculation logic
        let totalScore = 0;
        let validSubjects = 0;
        const details: SubjectScoreCalculationDetail[] = [];

        for (const subject of this.subjectScores) {
            const percentile = this.computePercentileFromSubject(subject);

            if (this.shouldIncludeSubject(subject)) {
                const convertedScore = this.convertScore(percentile || 0, subject);
                totalScore += convertedScore;
                validSubjects++;

                subject.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: subject.id,
                    isReflected: true,
                    convertedScore,
                    convertedBaseValue: 'PERCENTILE',
                    conversionFormula: `percentile * grade_weight(${subject.grade})`,
                });
            } else {
                subject.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: subject.id,
                    isReflected: false,
                    nonReflectionReason: '저학년 과목 제외',
                });
            }

            details.push(subject.calculationDetail);
        }

        const finalScore = validSubjects > 0 ? totalScore / validSubjects : 0;
        this.scoreResult = new StudentScoreResult(this.id, 0, finalScore);
    }

    private shouldIncludeSubject(subject: Subject): boolean {
        // Exclude lower grade subjects for SMWU
        return subject.grade >= 2;
    }

    private convertScore(percentile: number, subject: Subject): number {
        const gradeWeight = subject.grade === 3 ? 1.2 : 1.0;
        return percentile * 0.8 * gradeWeight;
    }
}
