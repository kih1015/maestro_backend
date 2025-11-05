import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { StudentScoreResult, Subject, SubjectScoreCalculationDetail } from '../entities/student.entity';
import { TukoreaConfig } from '../config/tukorea.config';

export class TukoreaScoreCalculationHandler extends BaseScoreHandler {
    protected readonly handlerType = 'TukoreaScoreCalculationHandler';
    private readonly subject = '한국공학대학교 점수 계산';
    private readonly description = '한국공학대학교 교과 성적 산출 방식에 따라 최종 점수를 계산합니다.';

    constructor(private readonly config: TukoreaConfig) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const admissionType = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        // 특성화고교졸업자 전형
        if (admissionType === TukoreaConfig.VOCATIONAL_ADMISSION_CODE) {
            this.calculateVocationalAdmission(context);
        } else {
            // 일반 전형 (논술우수자, 교과우수자, 지역균형)
            this.calculateGeneralAdmission(context, unitCode);
        }
    }

    /**
     * 특성화고교졸업자 전형 점수 계산
     * 석차등급 또는 석차백분율이 존재하는 전과목 반영
     */
    private calculateVocationalAdmission(context: ScoreCalculationContext): void {
        const student = context.student;
        const reflectedScores: Subject[] = [];

        // 석차등급 또는 석차백분율이 있는 과목만 필터링
        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) {
                continue;
            }

            // 점수 변환 (등급 또는 석차 백분율)
            const scoreResult = this.convertScoreFromGradeOrPercentile(s, student.graduateYear);
            if (scoreResult === null) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: '석차등급 및 석차백분율 없음',
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            s.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: s.id,
                isReflected: true,
                convertedScore: scoreResult.score,
                conversionFormula: scoreResult.formula,
                calculationHandler: this.handlerType,
            });

            reflectedScores.push(s);
        }

        // 반영 가능한 과목이 없으면 0점
        if (reflectedScores.length === 0) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '반영 가능한 과목이 없어 0점 처리');
            return;
        }

        // 이수단위 가중평균 계산
        const weightedAverage = this.calculateWeightedAverage(reflectedScores);

        // 최종 점수: 5 * 이수단위평균
        const finalScore = 5 * this.roundToDigits(weightedAverage, 4);
        student.scoreResult = StudentScoreResult.create(
            student.id,
            finalScore,
            0,
            `이수단위 가중평균: ${this.roundToDigits(weightedAverage, 4)}\n최종 점수: 5 × ${this.roundToDigits(weightedAverage, 4)} = ${finalScore}`,
        );
    }

    /**
     * 일반 전형 점수 계산
     * 교과별 석차등급 상위 4개 과목 반영
     */
    private calculateGeneralAdmission(context: ScoreCalculationContext, unitCode: string): void {
        const student = context.student;
        const admissionType = student.recruitmentTypeCode;

        // 반영교과 결정
        let reflectedSubjectGroups: string[];
        if (unitCode === TukoreaConfig.ENGINEERING_UNIT) {
            reflectedSubjectGroups = TukoreaConfig.ENGINEERING_SUBJECTS;
        } else if (unitCode === TukoreaConfig.BUSINESS_UNIT) {
            reflectedSubjectGroups = TukoreaConfig.BUSINESS_SUBJECTS;
        } else {
            // 기본값: 공학계열
            reflectedSubjectGroups = TukoreaConfig.ENGINEERING_SUBJECTS;
        }

        // 교과별로 과목 분류
        const subjectsByGroup: Map<string, Subject[]> = new Map();
        const koreanHistorySubjects: Subject[] = []; // 한국사 과목 수집

        for (const s of student.subjectScores) {
            if (s.calculationDetail && !s.calculationDetail.isReflected) {
                continue;
            }

            const subjectGroup = s.subjectGroup || '';

            // 한국사는 나중에 처리하기 위해 수집
            if (s.subjectName === '한국사') {
                koreanHistorySubjects.push(s);
                continue;
            }

            // 반영교과 필터링
            if (!reflectedSubjectGroups.includes(subjectGroup)) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: `반영교과 아님 (${subjectGroup})`,
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            // 교과별로 그룹화
            if (!subjectsByGroup.has(subjectGroup)) {
                subjectsByGroup.set(subjectGroup, []);
            }
            subjectsByGroup.get(subjectGroup)!.push(s);
        }

        // 경영학부의 경우 사회 또는 과학 중 이수단위 많은 쪽 선택
        if (unitCode === TukoreaConfig.BUSINESS_UNIT) {
            this.selectBusinessSubjectGroup(subjectsByGroup);
        }

        // 한국사 처리: 점수 가장 높은 것 선택 (2순위: 이수단위)
        if (koreanHistorySubjects.length > 0) {
            this.handleKoreanHistory(koreanHistorySubjects, unitCode, subjectsByGroup, student.graduateYear);
        }

        // 교과별 상위 4개 과목 선택 및 진로선택과목 추가
        const selectedScores: Subject[] = [];
        for (const [group, subjects] of subjectsByGroup) {
            const selected = this.selectTopSubjects(subjects, group, student.graduateYear);
            selectedScores.push(...selected);
        }

        // 반영교과내 석차등급이 있는 교과가 1개도 없으면 0점
        if (selectedScores.length === 0) {
            student.scoreResult = StudentScoreResult.create(student.id, 0, 0, '반영 가능한 과목이 없어 0점 처리');
            return;
        }

        // 이수단위 가중평균 계산
        const weightedAverage = this.calculateWeightedAverage(selectedScores);

        // 최종 점수 계산
        let finalScore: number;
        let formula: string;

        if (admissionType === TukoreaConfig.ESSAY_ADMISSION) {
            // 논술우수자: 이수단위평균
            finalScore = this.roundToDigits(weightedAverage, 4);
            formula = `이수단위 가중평균: ${finalScore}`;
        } else {
            // 그 외 전형: 5 * 이수단위평균
            finalScore = 5 * this.roundToDigits(weightedAverage, 4);
            formula = `이수단위 가중평균: ${this.roundToDigits(weightedAverage, 4)}\n최종 점수: 5 × ${this.roundToDigits(weightedAverage, 4)} = ${finalScore}`;
        }

        student.scoreResult = StudentScoreResult.create(student.id, finalScore, 0, formula);
    }

    /**
     * 한국사 과목 처리
     * 공학계열: 과학 교과에 포함
     * 경영학부: 사회 또는 과학 중 이수단위 많은 교과에 포함
     * 점수가 가장 높은 것 선택 (2순위: 이수단위)
     */
    private handleKoreanHistory(
        koreanHistorySubjects: Subject[],
        unitCode: string,
        subjectsByGroup: Map<string, Subject[]>,
        graduateYear: string,
    ): void {
        if (koreanHistorySubjects.length === 0) {
            return;
        }

        // 목표 교과 결정
        let targetGroup: string;
        if (unitCode === TukoreaConfig.ENGINEERING_UNIT) {
            // 공학계열: 과학 교과에 포함
            targetGroup = '과학';
        } else if (unitCode === TukoreaConfig.BUSINESS_UNIT) {
            // 경영학부: 사회 또는 과학 중 이수단위 많은 교과에 포함
            const socialUnits = this.getTotalUnits(subjectsByGroup.get('사회') || []);
            const scienceUnits = this.getTotalUnits(subjectsByGroup.get('과학') || []);
            targetGroup = socialUnits >= scienceUnits ? '사회' : '과학';
        } else {
            // 기본값: 과학
            targetGroup = '과학';
        }

        // 한국사 정렬: 점수 높은 순 (1순위), 이수단위 높은 순 (2순위)
        const sortedKoreanHistory = [...koreanHistorySubjects].sort((a, b) => {
            const scoreA = this.convertScoreFromGradeOrPercentile(a, graduateYear)?.score || 0;
            const scoreB = this.convertScoreFromGradeOrPercentile(b, graduateYear)?.score || 0;

            if (scoreA !== scoreB) {
                return scoreB - scoreA; // 점수 높은 순
            }

            // 점수가 같으면 이수단위 높은 순
            const unitA = parseFloat(a.unit || '0');
            const unitB = parseFloat(b.unit || '0');
            return unitB - unitA;
        });

        // 가장 좋은 한국사 1개만 선택
        const selectedKoreanHistory = sortedKoreanHistory[0];
        const excludedKoreanHistory = sortedKoreanHistory.slice(1);

        // 선택된 한국사를 해당 교과에 추가
        if (!subjectsByGroup.has(targetGroup)) {
            subjectsByGroup.set(targetGroup, []);
        }

        selectedKoreanHistory.subjectGroup = targetGroup;
        subjectsByGroup.get(targetGroup)!.push(selectedKoreanHistory);

        // 제외된 한국사들 처리
        for (const excludedSubject of excludedKoreanHistory) {
            const scoreResult = this.convertScoreFromGradeOrPercentile(excludedSubject, graduateYear);
            const scoreInfo = scoreResult ? `점수: ${scoreResult.score}` : '점수 없음';
            excludedSubject.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: excludedSubject.id,
                isReflected: false,
                nonReflectionReason: `한국사는 ${targetGroup} 교과에 최대 1과목만 포함 (${scoreInfo}, 이수단위: ${excludedSubject.unit})`,
                calculationHandler: this.handlerType,
            });
        }
    }

    /**
     * 경영학부: 사회 또는 과학 중 이수단위 많은 쪽 선택
     */
    private selectBusinessSubjectGroup(subjectsByGroup: Map<string, Subject[]>): void {
        const socialSubjects = subjectsByGroup.get('사회') || [];
        const scienceSubjects = subjectsByGroup.get('과학') || [];

        const socialUnits = this.getTotalUnits(socialSubjects);
        const scienceUnits = this.getTotalUnits(scienceSubjects);

        // 이수단위가 적은 쪽 제거
        if (socialUnits >= scienceUnits) {
            // 과학 제거
            for (const s of scienceSubjects) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: `경영학부: 사회 교과의 이수단위(${socialUnits})가 과학 교과(${scienceUnits})보다 많아 과학 교과 제외`,
                    calculationHandler: this.handlerType,
                });
            }
            subjectsByGroup.delete('과학');
        } else {
            // 사회 제거
            for (const s of socialSubjects) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: `경영학부: 과학 교과의 이수단위(${scienceUnits})가 사회 교과(${socialUnits})보다 많아 사회 교과 제외`,
                    calculationHandler: this.handlerType,
                });
            }
            subjectsByGroup.delete('사회');
        }
    }

    /**
     * 교과별 상위 4개 과목 선택 + 진로선택과목 추가
     * 진로선택과목: 교과별 최대 2개 추가 반영, 이수단위 1로 적용
     */
    private selectTopSubjects(subjects: Subject[], subjectGroup: string, graduateYear: string): Subject[] {
        const regularSubjects: Subject[] = []; // 석차등급 또는 석차백분율이 있는 일반 과목
        const careerSubjects: Subject[] = []; // 진로선택과목 (성취도)

        // 과목 분류
        for (const s of subjects) {
            const hasGradeOrPercentile = this.convertScoreFromGradeOrPercentile(s, graduateYear) !== null;

            // 진로선택과목: subjectSeparationCode === '02'인 것만 반영
            if (s.subjectSeparationCode === '02') {
                careerSubjects.push(s);
            } else if (hasGradeOrPercentile) {
                // 일반 과목 (석차등급 또는 석차백분율이 있는 경우)
                regularSubjects.push(s);
            } else {
                // 석차등급도 석차백분율도 없는 과목
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: '석차등급 및 석차백분율 없음',
                    calculationHandler: this.handlerType,
                });
            }
        }

        // 일반 과목: 점수 기준 상위 4개 선택 (점수 높을수록 상위)
        regularSubjects.sort((a, b) => {
            const scoreA = this.convertScoreFromGradeOrPercentile(a, graduateYear)?.score || 0;
            const scoreB = this.convertScoreFromGradeOrPercentile(b, graduateYear)?.score || 0;
            if (scoreA !== scoreB) {
                return scoreB - scoreA; // 점수 높을수록 상위
            }
            // 점수 같으면 이수단위 많은 것 우선
            const unitA = parseFloat(a.unit || '0');
            const unitB = parseFloat(b.unit || '0');
            return unitB - unitA;
        });

        const selectedRegular = regularSubjects.slice(0, 4);
        const excludedRegular = regularSubjects.slice(4);

        // 일반 과목 점수 변환
        for (const s of selectedRegular) {
            const scoreResult = this.convertScoreFromGradeOrPercentile(s, graduateYear);
            if (scoreResult === null) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: '점수 변환 실패',
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            s.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: s.id,
                isReflected: true,
                convertedScore: scoreResult.score,
                conversionFormula: scoreResult.formula,
                calculationHandler: this.handlerType,
            });
        }

        // 제외된 일반 과목
        for (const s of excludedRegular) {
            const scoreResult = this.convertScoreFromGradeOrPercentile(s, graduateYear);
            const scoreInfo = scoreResult ? `점수: ${scoreResult.score}` : '점수 없음';
            s.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: s.id,
                isReflected: false,
                nonReflectionReason: `${subjectGroup} 교과 상위 4개 과목에 미포함 (${scoreInfo})`,
                calculationHandler: this.handlerType,
            });
        }

        // 진로선택과목: 성취도 기준 상위 2개 선택
        careerSubjects.sort((a, b) => {
            const achievementA = a.achievement || 'Z';
            const achievementB = b.achievement || 'Z';
            if (achievementA !== achievementB) {
                return achievementA.localeCompare(achievementB); // A < B < C
            }
            // 성취도 같으면 이수단위 많은 것 우선
            const unitA = parseFloat(a.unit || '0');
            const unitB = parseFloat(b.unit || '0');
            return unitB - unitA;
        });

        const selectedCareer = careerSubjects.slice(0, 2);
        const excludedCareer = careerSubjects.slice(2);

        // 진로선택과목 점수 변환 (이수단위 1로 적용)
        for (const s of selectedCareer) {
            const achievement = s.achievement;
            if (!achievement || !TukoreaConfig.ACHIEVEMENT_SCORE_MAPPING[achievement]) {
                s.calculationDetail = new SubjectScoreCalculationDetail({
                    subjectScoreId: s.id,
                    isReflected: false,
                    nonReflectionReason: `유효하지 않은 성취도: ${achievement || '없음'}`,
                    calculationHandler: this.handlerType,
                });
                continue;
            }

            const convertedScore = TukoreaConfig.ACHIEVEMENT_SCORE_MAPPING[achievement];

            // 이수단위를 1로 변경 (원본은 유지하고 calculationDetail에 기록)
            s.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: s.id,
                isReflected: true,
                convertedScore: convertedScore,
                conversionFormula: `진로선택과목 성취도 ${achievement} → ${convertedScore}점 (이수단위 1 적용)`,
                calculationHandler: this.handlerType,
            });

            // 이수단위를 1로 설정 (가중평균 계산용)
            s.unit = '1';
        }

        // 제외된 진로선택과목
        for (const s of excludedCareer) {
            const achievement = s.achievement || '없음';
            s.calculationDetail = new SubjectScoreCalculationDetail({
                subjectScoreId: s.id,
                isReflected: false,
                nonReflectionReason: `${subjectGroup} 교과 진로선택과목 상위 2개에 미포함 (성취도: ${achievement})`,
                calculationHandler: this.handlerType,
            });
        }

        return [...selectedRegular, ...selectedCareer.filter(s => s.calculationDetail?.isReflected)];
    }

    /**
     * 총 이수단위 계산
     */
    private getTotalUnits(subjects: Subject[]): number {
        return subjects.reduce((sum, s) => sum + parseFloat(s.unit || '0'), 0);
    }

    /**
     * 등급 추출
     */
    private getGrade(s: Subject): number | null {
        if (!s.rankingGrade) {
            return null;
        }

        const grade = parseInt(s.rankingGrade);
        if (isNaN(grade) || grade < 1 || grade > 9) {
            return null;
        }

        return grade;
    }

    /**
     * 석차 백분율 계산
     * 석차백분율 = [석차 + {(동석차인원 - 1) / 2}] / 재적수 * 100
     * 소수점 둘째자리까지 반올림
     */
    private calculatePercentileRank(s: Subject): number | null {
        const rank = parseFloat(s.rank || '');
        const sameRank = parseFloat(s.sameRank || '1');
        const studentCount = parseFloat(s.studentCount || '');

        if (isNaN(rank) || isNaN(studentCount) || studentCount === 0) {
            return null;
        }

        const adjustedRank = rank + (sameRank - 1) / 2;
        const percentile = (adjustedRank / studentCount) * 100;

        // 소수점 둘째자리까지 반올림
        return this.roundToDigits(percentile, 2);
    }

    /**
     * 석차 백분율을 점수로 변환
     */
    private convertPercentileToScore(percentile: number): number {
        for (const mapping of TukoreaConfig.PERCENTILE_SCORE_MAPPING) {
            if (percentile <= mapping.threshold) {
                return mapping.score;
            }
        }
        return 25; // 기본값
    }

    /**
     * 등급 또는 석차 백분율에서 점수 변환
     * 등급이 있으면 등급 점수, 없으면 석차 백분율 점수 반환
     */
    private convertScoreFromGradeOrPercentile(
        s: Subject,
        graduateYear: string,
    ): {
        score: number;
        formula: string;
    } | null {
        // 1. 등급 우선
        const grade = this.getGrade(s);
        if (grade !== null) {
            const score = TukoreaConfig.GRADE_SCORE_MAPPING[grade];
            if (score !== undefined) {
                return {
                    score: score,
                    formula: `등급 ${grade} → ${score}점`,
                };
            }
        }

        if (Number(graduateYear) > 2006) {
            return null;
        }

        // 2. 석차 백분율
        const percentile = this.calculatePercentileRank(s);
        if (percentile !== null) {
            const score = this.convertPercentileToScore(percentile);
            return {
                score: score,
                formula: `석차백분율 ${percentile}% → ${score}점`,
            };
        }

        return null;
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
                    admissions: ['61', '11', '62', '80'],
                    units: ['46', '20'],
                    formula:
                        '논술우수자(61): 이수단위평균, 그 외 전형: 5 × 이수단위평균. 교과별 상위 4개 + 진로선택 최대 2개',
                },
            ],
        };
    }
}
