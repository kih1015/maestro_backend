import { BaseScoreHandler, HandlerInfo, ScoreCalculationContext } from './base-handler';
import { Subject, SubjectScoreCalculationDetail } from '../entities/student.entity';

export interface DefaultScoreFillerConfig {
    admissions: string[];
    units: string[];
    subjectSeparations: string[];
    targetCourseCount: number;
    defaultGrade: number;
    defaultUnit: number;
}

export class DefaultScoreFillerHandler extends BaseScoreHandler {
    protected readonly handlerType = 'DefaultScoreFillerHandler';
    private readonly subject = '기본 과목 추가';
    private readonly description = '반영 과목이 목표 개수에 미달할 경우, 부족한 개수만큼 기본 점수로 채웁니다.';

    constructor(private readonly config: DefaultScoreFillerConfig[]) {
        super();
    }

    protected process(context: ScoreCalculationContext): void {
        const student = context.student;
        const type = student.recruitmentTypeCode;
        const unitCode = student.recruitmentUnitCode;

        const config = this.findConfig(type, unitCode);
        if (!config) {
            return;
        }

        // 현재 반영된 과목 수 계산 (해당 subjectSeparations만)
        const reflectedSubjects = student.subjectScores.filter(
            s => s.calculationDetail?.isReflected && config.subjectSeparations.includes(s.subjectSeparationCode || ''),
        );

        const currentCount = reflectedSubjects.length;
        const targetCount = config.targetCourseCount;

        if (currentCount >= targetCount) {
            return; // 이미 목표 개수 이상이면 추가하지 않음
        }

        const deficit = targetCount - currentCount;

        // 기본 점수로 가상 과목 추가
        for (let i = 0; i < deficit; i++) {
            const virtualSubject = this.createVirtualSubject(
                student.subjectScores.length + i,
                config.defaultGrade,
                config.defaultUnit,
            );
            student.subjectScores.push(virtualSubject);
        }
    }

    private createVirtualSubject(id: number, defaultGrade: number, defaultUnit: number): Subject {
        const virtualSubject = new Subject({
            id: -(id + 1), // 음수 ID로 가상 과목 표시
            seqNumber: 9999 + id,
            subjectName: '기본점수',
            subjectCode: 'DEFAULT',
            subjectGroup: '기본',
            subjectSeparationCode: '01', // 공통과목으로 설정
            rankingGrade: defaultGrade.toString(),
            achievement: '',
            assessment: null,
            originalScore: null,
            unit: defaultUnit.toString(),
            grade: 0,
            term: 0,
            studentCount: undefined,
            rank: undefined,
            sameRank: undefined,
            avgScore: undefined,
            standardDeviation: undefined,
            achievementRatio: undefined,
        });

        // 기본 등급에 해당하는 점수로 변환
        // gradeConversionConfig에서 9등급 = 1점
        const convertedScore = this.getScoreFromGrade(defaultGrade);

        virtualSubject.calculationDetail = SubjectScoreCalculationDetail.create(
            virtualSubject.id,
            true,
            '기본점수',
            convertedScore,
            this.handlerType,
        );

        return virtualSubject;
    }

    private getScoreFromGrade(grade: number): number {
        // 성결대 gradeMapping: 1등급=5, 2등급=4.5, ..., 9등급=1
        const gradeMapping: Record<number, number> = {
            1: 5,
            2: 4.5,
            3: 4,
            4: 3.5,
            5: 3,
            6: 2.5,
            7: 2,
            8: 1.5,
            9: 1,
        };
        return gradeMapping[grade] ?? 1;
    }

    private findConfig(admission: string, unit: string): DefaultScoreFillerConfig | undefined {
        return this.config.find(config => config.admissions.includes(admission) && config.units.includes(unit));
    }

    public getInfo(): HandlerInfo {
        return {
            type: 'converter',
            subject: this.subject,
            description: this.description,
            handlerType: this.handlerType,
            config: this.config.map(c => ({
                admissions: c.admissions,
                units: c.units,
                formula: `목표: ${c.targetCourseCount}개, 기본등급: ${c.defaultGrade}, 기본단위: ${c.defaultUnit}`,
            })),
        };
    }
}
