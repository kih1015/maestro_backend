import { FinalScoreConfig } from '../handlers/final-score-calculation-handler';
import { SubjectConfig } from '../handlers/subject-group-filter-handler';
import { SemesterReflectionConfig } from '../handlers/semester-reflection-handler';
import { AchievementToGradeConfig } from '../handlers/achievement-to-grade-conversion-handler';
import { ZScoreGradeConfig } from '../handlers/zscore-grade-conversion-handler';
import { PercentileGradeConfig } from '../handlers/percentile-grade-conversion-handler';
import { BestSemesterSelectionConfig } from '../handlers/best-semester-selection-handler';
import { BestSubjectSelectionConfig } from '../handlers/best-subject-selection-handler';
import { FinalGradeToScoreConfig } from '../handlers/final-grade-to-score-handler';
import { GradeConversionConfig } from '../handlers/grade-conversion-handler';
import { UnconvertedScoreFilterConfig } from '../handlers/unconverted-score-filter-handler';
import { WeightApplyConfig } from '../handlers/weight-apply-handler';

export class GyeongbokConfig {
    private static readonly ADMISSION_CODES = {
        전형11: '11',
        전형12: '12',
        전형61: '61',
        전형62: '62',
        전형72: '72',
        전형74: '74',
        전형75: '75',
        전형76: '76',
        전형78: '78',
        전형80: '80',
    } as const;

    private static readonly UNIT_CODES = {
        항공서비스과: '01',
        모집02: '02',
        모집03: '03',
        작업치료과: '04',
        모집05: '05',
        모집06: '06',
        모집07: '07',
        모집08: '08',
        모집09: '09',
        모집10: '10',
        모집11: '11',
        모집12: '12',
        모집13: '13',
        모집14: '14',
        모집15: '15',
        모집16: '16',
        모집17: '17',
        간호학과: '18',
        모집19: '19',
        모집20: '20',
        모집21: '21',
        모집22: '22',
        물리치료과: '23',
        모집24: '24',
        준오헤어디자인과: '25',
        모집27: '27',
        치위생과: '29',
        모집31: '31',
        모집32: '32',
        임상병리과: '36',
        공연예술과: '37',
        모집38: '38',
        모집39: '39',
        모집40: '40',
        모집41: '41',
        모집42: '42',
        모집44: '44',
        실용음악과: '45',
        모집46: '46',
        모집48: '48',
        모집49: '49',
        모집51: '51',
        모집52: '52',
        모집55: '55',
        모집58: '58',
        모집59: '59',
        모집62: '62',
        모집63: '63',
        모집64: '64',
        모집65: '65',
        모집67: '67',
        모집68: '68',
        모집69: '69',
        모집71: '71',
        모집74: '74',
        모집75: '75',
        모집76: '76',
        모집77: '77',
        모집78: '78',
        모집79: '79',
        모집80: '80',
    } as const;

    private static readonly NURSING_HEALTH_UNITS: string[] = [
        this.UNIT_CODES.간호학과,
        this.UNIT_CODES.치위생과,
        this.UNIT_CODES.작업치료과,
        this.UNIT_CODES.임상병리과,
        this.UNIT_CODES.물리치료과,
    ];

    private static readonly GENERAL_UNITS = Object.values(this.UNIT_CODES).filter(
        x => !this.NURSING_HEALTH_UNITS.includes(x),
    );

    static readonly ADMISSION_CODE_TO_NAME: Record<string, string> = {
        '01': '일반전형',
    };

    static readonly UNIT_CODE_TO_NAME: Record<string, string> = {
        '18': '간호학과',
        '29': '치위생과',
        '04': '작업치료과',
        '36': '임상병리과',
        '23': '물리치료과',
        '01': '항공서비스과',
        '25': '준오헤어디자인과',
        '45': '실용음악과',
        '37': '공연예술과',
    };

    private static readonly ALL_ADMISSIONS_CODES = [...Object.values(this.ADMISSION_CODES)];

    private static readonly ALL_UNIT_CODES = [...Object.values(this.UNIT_CODES)];

    readonly semesterReflectionConfig: SemesterReflectionConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.ALL_UNIT_CODES],
            maxGrade: 3,
            maxTerm: 1,
            excludeEarlyGraduateSecondGradeSecondTerm: false,
            isNotAppliedForGraduate: false,
        },
    ];

    readonly subjectConfigs: SubjectConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.NURSING_HEALTH_UNITS], // 간호보건계열만
            reflectedSubjects: ['국어', '영어', '수학', '사회', '과학'],
        },
    ];

    readonly achievementToGradeConfig: AchievementToGradeConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.ALL_UNIT_CODES],
            subjectSeparations: ['02'], // 진로선택과목만
            achievementMapping: {
                A: 1,
                B: 3,
                C: 5,
            },
        },
    ];

    readonly gradeConversionConfig: GradeConversionConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '03'],
            gradeMapping: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
                9: 9,
            },
        },
    ];

    readonly zScoreGradeConfig: ZScoreGradeConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '03'], // 일반선택과목
        },
    ];

    readonly percentileGradeConfig: PercentileGradeConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.ALL_UNIT_CODES],
            subjectSeparations: ['01', '03'], // 모든 과목
            graduateYearThreshold: 2008, // 2008년 이전 졸업자에게만 적용
            gradeScoreMapping: {
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
                9: 9,
            },
        },
    ];

    readonly bestSemesterSelectionConfig: BestSemesterSelectionConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.GENERAL_UNITS], // 일반학과만
            bestSemesterCount: 2,
        },
    ];

    readonly bestSubjectSelectionConfig: BestSubjectSelectionConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.NURSING_HEALTH_UNITS], // 간호보건계열만
            bestSubjectCount: 3,
        },
    ];

    readonly finalGradeToScoreConfig: FinalGradeToScoreConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.ALL_UNIT_CODES],
        },
    ];

    readonly finalScoreConfig: FinalScoreConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.ALL_UNIT_CODES],
        },
    ];

    readonly unconvertedScoreFilterConfig: UnconvertedScoreFilterConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [...GyeongbokConfig.ALL_UNIT_CODES],
        },
    ];

    readonly weightApplyConfig: WeightApplyConfig[] = [
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [GyeongbokConfig.UNIT_CODES.실용음악과, GyeongbokConfig.UNIT_CODES.공연예술과],
            weight: 0.2,
        },
        {
            admissions: [...GyeongbokConfig.ALL_ADMISSIONS_CODES],
            units: [GyeongbokConfig.UNIT_CODES.항공서비스과, GyeongbokConfig.UNIT_CODES.준오헤어디자인과],
            weight: 0.4,
        },
    ];
}
