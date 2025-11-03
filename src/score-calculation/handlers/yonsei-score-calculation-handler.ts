import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult, Subject, SubjectScoreCalculationDetail } from '../entities/student.entity';
import { YonseiConfig } from '../config/yonsei.config';

export class YonseiScoreCalculationHandler extends BaseScoreHandler {
    protected readonly handlerType = 'YonseiScoreCalculationHandler';
    private readonly subject = '연세대학교 점수 계산';
    private readonly description = '연세대학교 교과 성적 산출 방식에 따라 최종 점수를 계산합니다.';

    constructor(private readonly config: YonseiConfig) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;

        // 특기자 전형 (80)
        if (type === '80') {
            this.calculateTalentAdmission(context);
        } else {
            // 일반 전형
            this.calculateGeneralAdmission(context);
        }
    }

    /**
     * 특기자 전형 점수 계산
     * 반영교과: 국어, 영어, 수학, 체육
     * 이수단위 가중평균
     */
    private calculateTalentAdmission(context: ScoreCalculationContext): void {
        const student = context.student;
        const reflectedScores: Subject[] = [];

        // 반영교과 필터링 및 점수 변환
        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) {
                continue;
            }

            // 유효성 검증
            const validationResult = this.validateSubjectScore(s);
            if (!validationResult.isValid) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: validationResult.reason,
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            const subjectGroup = s.subjectGroup || '';
            if (!YonseiConfig.TALENT_SUBJECTS.includes(subjectGroup)) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: `반영 교과가 아님 (${subjectGroup})`,
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            const convertedScore = this.convertTalentScore(s);
            if (convertedScore === null) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: '점수 변환 불가',
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            s.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: s.id,
                isReflected: true,
                convertedScore: convertedScore,
                conversionFormula: this.getTalentConversionFormula(s, convertedScore),
                calculationHandler: this.handlerType,
            });

            reflectedScores.push(s);
        }

        // 이수단위 가중평균 계산
        const finalScore = this.calculateWeightedAverage(reflectedScores);
        student.scoreResult = StudentScoreResult.create(
            student.id,
            this.roundToDigits(finalScore, 4),
            0,
            `이수단위 가중평균 = ${this.roundToDigits(finalScore, 4)}`,
        );
    }

    /**
     * 일반 전형 점수 계산
     * 최종 산출 식 = 반영과목 A 점수 - 반영과목 B 감점 점수
     */
    private calculateGeneralAdmission(context: ScoreCalculationContext): void {
        const student = context.student;

        // 과목 분류
        const commonSubjects: Subject[] = [];
        const generalSubjects: Subject[] = [];
        const careerSubjects: Subject[] = [];
        const vocationalSubjects: Subject[] = [];
        const subjectBScores: Subject[] = [];

        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) {
                continue;
            }

            // 유효성 검증
            const validationResult = this.validateSubjectScore(s);
            if (!validationResult.isValid) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: validationResult.reason,
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            const subjectGroup = s.subjectGroup || '';
            const subjectType = this.getSubjectType(s);
            const isSubjectA = YonseiConfig.SUBJECT_GROUP_A.includes(subjectGroup);

            // 반영과목 B (반영과목 A가 아닌 것)
            if (!isSubjectA) {
                const grade = this.getGrade(s);
                const achievement = s.achievement;
                const isPenalty =
                    (s.subjectSeparationCode === '01' && grade === 9) ||
                    (s.subjectSeparationCode !== '01' && achievement === 'C');

                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: isPenalty
                        ? `반영과목 B (감점에 반영: ${grade === 9 ? '9등급' : '성취도 C'})`
                        : '반영과목 B (감점 계산에 사용)',
                    calculationHandler: this.handlerType,
                });

                subjectBScores.push(s);
                continue;
            }

            // 과목 유형별 분류
            if (subjectType === 'common') {
                commonSubjects.push(s);
            } else if (subjectType === 'general') {
                generalSubjects.push(s);
            } else if (subjectType === 'career') {
                careerSubjects.push(s);
            } else if (subjectType === 'vocational') {
                vocationalSubjects.push(s);
            } else {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: '과목 유형 분류 불가',
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            // 점수 변환
            const convertedScore = this.convertGeneralScore(s, subjectType);
            if (convertedScore === null) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: '점수 변환 불가',
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            s.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: s.id,
                isReflected: true,
                convertedScore: convertedScore,
                conversionFormula: this.getGeneralConversionFormula(s, subjectType, convertedScore),
                calculationHandler: this.handlerType,
            });
        }

        // 반영과목 A 점수 계산
        const commonScore = this.calculateWeightedAverage(commonSubjects.filter(s => s.calculationDetail?.isReflected));
        const generalScore = this.calculateWeightedAverage(
            generalSubjects.filter(s => s.calculationDetail?.isReflected),
        );
        const careerScore = this.calculateWeightedAverage(careerSubjects.filter(s => s.calculationDetail?.isReflected));

        const subjectAScore = commonScore * 0.3 + generalScore * 0.5 + careerScore * 0.2;

        // 반영과목 B 감점 계산
        const deduction = this.calculateSubjectBDeduction(subjectBScores);

        // 최종 점수
        const finalScore = this.roundToDigits(subjectAScore - deduction, 4);
        student.scoreResult = StudentScoreResult.create(
            student.id,
            finalScore,
            0,
            `반영과목 A 점수: (공통 ${commonScore} × 0.3) + (일반선택 ${generalScore} × 0.5) + (진로선택 ${careerScore} × 0.2) = ${subjectAScore}\n` +
                `반영과목 B 감점: ${deduction}\n` +
                `최종 점수: ${subjectAScore} - ${deduction} = ${finalScore}`,
        );
    }

    /**
     * 과목 유형 판별
     * - common: 공통 교과
     * - general: 일반선택 교과
     * - career: 진로선택 교과
     * - vocational: 전문교과
     */
    private getSubjectType(s: Subject): 'common' | 'general' | 'career' | 'vocational' | null {
        const subjectSep = s.subjectSeparationCode;

        // 전문교과: RankingGrade에 A, B, C, D, E 있고 ('01')
        if (subjectSep === '01' && ['A', 'B', 'C', 'D', 'E'].includes(s.rankingGrade)) {
            return 'vocational';
        }

        // 진로선택: '02'
        if (subjectSep === '02') {
            return 'career';
        }

        // '01' 교과 중 과목명으로 구분
        if (subjectSep === '01') {
            // 공통 교과
            if (YonseiConfig.COMMON_SUBJECTS.includes(s.subjectName)) {
                return 'common';
            }
            // 일반선택 교과
            return 'general';
        }

        return null;
    }

    /**
     * 일반 전형 점수 변환
     */
    private convertGeneralScore(
        s: Subject,
        subjectType: 'common' | 'general' | 'career' | 'vocational',
    ): number | null {
        // 공통/일반선택: (등급 점수 * 0.5) + (Z점수 점수 * 0.5)
        if (subjectType === 'common' || subjectType === 'general') {
            return this.convertCommonGeneralScore(s);
        }

        // 진로선택: 성취도 점수
        if (subjectType === 'career') {
            return this.convertCareerScore(s);
        }

        // 전문교과: 등급 점수
        if (subjectType === 'vocational') {
            return this.convertVocationalScore(s);
        }

        return null;
    }

    /**
     * 공통/일반선택 점수 변환
     * 석차등급활용점수 * 0.5 + z점수활용환산점수 * 0.5
     */
    private convertCommonGeneralScore(s: Subject): number | null {
        const grade = this.getGrade(s);
        if (grade === null) {
            return null;
        }

        // 등급 점수
        const gradeScore = YonseiConfig.GRADE_SCORE_MAPPING[grade] || 0;

        // Z점수 점수
        const zScore = this.calculateZScore(s);
        if (zScore === null) {
            // Z점수를 계산할 수 없으면 등급 점수만 사용
            return gradeScore;
        }

        const zScorePoint = this.convertZScoreToPoint(zScore, grade);

        return gradeScore * 0.5 + zScorePoint * 0.5;
    }

    /**
     * Z점수를 점수로 변환
     * 1. Z점수를 석차백분율로 변환
     * 2. 점수 = 100 × (1 - 석차백분율)
     * 3. 저점 보정: 등급별 최소 점수 적용
     */
    private convertZScoreToPoint(zScore: number, grade: number): number {
        // Z점수 범위 제한: -3.0 ~ 3.0
        let limitedZ = Math.max(-3.0, Math.min(3.0, zScore));

        // 소수점 첫째 자리까지 반올림
        limitedZ = this.roundToDigits(limitedZ, 1);

        // 석차백분율 조회
        const percentile = YonseiConfig.Z_SCORE_TO_PERCENTILE[limitedZ.toFixed(1)] || 0.5;

        // 점수 계산
        let score = 100 * (1 - percentile);

        // 저점 보정: 등급별 최소 점수
        const minPercentile = YonseiConfig.GRADE_MIN_PERCENTILE[grade];
        if (minPercentile !== undefined) {
            const minScore = 100 * (1 - minPercentile);
            score = Math.max(score, minScore);
        }

        return score;
    }

    /**
     * 진로선택 점수 변환
     * 성취도 기반
     */
    private convertCareerScore(s: Subject): number | null {
        const achievement = s.achievement;
        if (!achievement) {
            return null;
        }

        return YonseiConfig.ACHIEVEMENT_SCORE_MAPPING[achievement] || null;
    }

    /**
     * 전문교과 점수 변환
     */
    private convertVocationalScore(s: Subject): number | null {
        const grade = s.rankingGrade;
        if (!grade) {
            return null;
        }

        return YonseiConfig.VOCATIONAL_SCORE_MAPPING[grade] || null;
    }

    /**
     * 특기자 전형 점수 변환
     */
    private convertTalentScore(s: Subject): number | null {
        // 등급 또는 전문교과
        if (s.rankingGrade) {
            const grade = this.getGrade(s);
            if (grade !== null) {
                return YonseiConfig.TALENT_GRADE_SCORE_MAPPING[grade] || null;
            }

            // 전문교과 (A, B, C, D, E)
            if (['A', 'B', 'C', 'D', 'E'].includes(s.rankingGrade)) {
                return YonseiConfig.TALENT_GRADE_SCORE_MAPPING[s.rankingGrade] || null;
            }
        }

        // 성취도
        if (s.achievement) {
            return YonseiConfig.TALENT_ACHIEVEMENT_SCORE_MAPPING[s.achievement] || null;
        }

        return null;
    }

    /**
     * 반영과목 B 감점 계산
     * (반영과목 B 중 석차등급 9등급 또는 성취도 C인 과목의 이수단위 합 / 반영과목 B 이수단위 합) * 5
     */
    private calculateSubjectBDeduction(subjectBScores: Subject[]): number {
        let totalUnit = 0;
        let penaltyUnit = 0;

        for (const s of subjectBScores) {
            const unit = parseFloat(s.unit || '0');
            totalUnit += unit;

            const grade = this.getGrade(s);
            const achievement = s.achievement;

            // 석차등급 9등급 또는 성취도 C
            if (
                (s.subjectSeparationCode === '01' && grade === 9) ||
                (s.subjectSeparationCode !== '01' && achievement === 'C')
            ) {
                penaltyUnit += unit;
            }
        }

        if (totalUnit === 0) {
            return 0;
        }

        return (penaltyUnit / totalUnit) * 5;
    }

    /**
     * Z점수 계산
     * Z = (원점수 - 평균) / 표준편차
     */
    private calculateZScore(s: Subject): number | null {
        const originalScore = s.originalScore ?? 0;
        const avgScore = parseFloat(s.avgScore || '0');
        const stdDev = parseFloat(s.standardDeviation || '0');

        if (stdDev === 0) {
            return null;
        }

        return (originalScore - avgScore) / stdDev;
    }

    /**
     * 등급 추출
     */
    private getGrade(s: Subject): number | null {
        if (!s.rankingGrade) {
            return null;
        }

        const grade = parseInt(s.rankingGrade);
        if (isNaN(grade)) {
            return null;
        }

        return grade;
    }

    /**
     * 과목 점수 유효성 검증
     * RankingGrade: 1~9 또는 A~E
     * Achievement: A~E
     */
    private validateSubjectScore(s: Subject): { isValid: boolean; reason: string } {
        const hasValidRankingGrade = this.isValidRankingGrade(s.rankingGrade);
        const hasValidAchievement = this.isValidAchievement(s.achievement);

        // 둘 다 유효하지 않으면 제외
        if (!hasValidRankingGrade && !hasValidAchievement) {
            return {
                isValid: false,
                reason: `유효하지 않은 등급/성취도 (등급: ${s.rankingGrade || '없음'}, 성취도: ${s.achievement || '없음'})`,
            };
        }

        return { isValid: true, reason: '' };
    }

    /**
     * RankingGrade 유효성 검증
     * 유효값: '1'~'9', 'A', 'B', 'C', 'D', 'E'
     */
    private isValidRankingGrade(rankingGrade: string): boolean {
        if (!rankingGrade) {
            return false;
        }

        // 1~9 등급
        const grade = parseInt(rankingGrade);
        if (!isNaN(grade) && grade >= 1 && grade <= 9) {
            return true;
        }

        // A~E 등급 (전문교과)
        if (['A', 'B', 'C', 'D', 'E'].includes(rankingGrade)) {
            return true;
        }

        return false;
    }

    /**
     * Achievement 유효성 검증
     * 유효값: 'A', 'B', 'C', 'D', 'E'
     */
    private isValidAchievement(achievement: string): boolean {
        if (!achievement) {
            return false;
        }

        return ['A', 'B', 'C', 'D', 'E'].includes(achievement);
    }

    /**
     * 이수단위 가중평균 계산
     */
    private calculateWeightedAverage(scores: Subject[]): number {
        let totalWeightedScore = 0;
        let totalUnit = 0;

        for (const s of scores) {
            const unit = parseFloat(s.unit || '0');
            const score = s.calculationDetail?.convertedScore || 0;

            totalWeightedScore += score * unit;
            totalUnit += unit;
        }

        if (totalUnit === 0) {
            return 0;
        }

        return totalWeightedScore / totalUnit;
    }

    /**
     * 일반 전형 변환 공식 문자열 생성
     */
    private getGeneralConversionFormula(s: Subject, subjectType: string, convertedScore: number): string {
        if (subjectType === 'common' || subjectType === 'general') {
            const grade = this.getGrade(s);
            const gradeScore = grade ? YonseiConfig.GRADE_SCORE_MAPPING[grade] : 0;
            const zScore = this.calculateZScore(s);

            if (zScore !== null) {
                const zScorePoint = this.convertZScoreToPoint(zScore, grade || 9);
                return `등급${grade}(${gradeScore}점) × 0.5 + Z점수(${zScore.toFixed(2)} → ${zScorePoint.toFixed(2)}점) × 0.5 = ${convertedScore.toFixed(2)}점`;
            } else {
                return `등급${grade} → ${convertedScore}점`;
            }
        }

        if (subjectType === 'career') {
            return `성취도 ${s.achievement} → ${convertedScore}점`;
        }

        if (subjectType === 'vocational') {
            return `전문교과 ${s.rankingGrade} → ${convertedScore}점`;
        }

        return `${convertedScore}점`;
    }

    /**
     * 특기자 전형 변환 공식 문자열 생성
     */
    private getTalentConversionFormula(s: Subject, convertedScore: number): string {
        if (s.rankingGrade) {
            const grade = this.getGrade(s);
            if (grade !== null) {
                return `등급 ${grade} → ${convertedScore}점`;
            }

            if (['A', 'B', 'C', 'D', 'E'].includes(s.rankingGrade)) {
                return `전문교과 ${s.rankingGrade} → ${convertedScore}점`;
            }
        }

        if (s.achievement) {
            return `성취도 ${s.achievement} → ${convertedScore}점`;
        }

        return `${convertedScore}점`;
    }

    /**
     * 소수점 반올림
     */
    private roundToDigits(value: number, digits: number): number {
        const multiplier = Math.pow(10, digits);
        return Math.floor(Number(value.toPrecision(15)) * multiplier + 0.5) / multiplier;
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'calc',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: [
                {
                    admissions: [],
                    units: [],
                    formula: '일반 전형: 반영과목 A 점수 - 반영과목 B 감점, 특기자 전형(80): 이수단위 가중평균',
                },
            ],
        };
    }
}
