export type ConvertedBaseValue = 'GRADE' | 'ACHIEVEMENT' | 'PERCENTILE' | 'Z_SCORE';

export class Student {
    id: number;
    identifyNumber: string;
    recruitmentTypeCode: string;
    recruitmentUnitCode: string;
    graduateYear: string;
    applicantScCode: string;
    graduateGrade: string;
    masterSchoolYN: string;
    specializedSchoolYN: string;
    subjectScores: Subject[];
    scoreResult: StudentScoreResult | null;

    constructor(
        id: number,
        identifyNumber: string,
        recruitmentTypeCode: string,
        recruitmentUnitCode: string,
        graduateYear: string,
        applicantScCode: string,
        graduateGrade: string,
        masterSchoolYN: string,
        specializedSchoolYN: string,
        subjectScores: Subject[],
        scoreResult: StudentScoreResult | null = null,
    ) {
        this.id = id;
        this.identifyNumber = identifyNumber;
        this.recruitmentTypeCode = recruitmentTypeCode;
        this.recruitmentUnitCode = recruitmentUnitCode;
        this.graduateYear = graduateYear;
        this.applicantScCode = applicantScCode;
        this.graduateGrade = graduateGrade;
        this.masterSchoolYN = masterSchoolYN;
        this.specializedSchoolYN = specializedSchoolYN;
        this.subjectScores = subjectScores;
        this.scoreResult = scoreResult;
    }

    static create(props: {
        id?: number;
        identifyNumber: string;
        recruitmentTypeCode: string;
        recruitmentUnitCode: string;
        graduateYear: string;
        applicantScCode: string;
        graduateGrade: string;
        masterSchoolYN: string;
        specializedSchoolYN: string;
        subjectScores: Subject[];
        scoreResult?: StudentScoreResult | null;
    }): Student {
        return new Student(
            props.id ?? 0,
            props.identifyNumber,
            props.recruitmentTypeCode,
            props.recruitmentUnitCode,
            props.graduateYear,
            props.applicantScCode,
            props.graduateGrade,
            props.masterSchoolYN,
            props.specializedSchoolYN,
            props.subjectScores,
            props.scoreResult ?? null,
        );
    }
}

export class Subject {
    id: number;
    seqNumber: number;
    subjectName: string;
    subjectCode: string;
    subjectGroup?: string | null;
    subjectSeparationCode: string;
    rankingGrade: string;
    achievement: string;
    assessment?: string | null;
    originalScore?: number | null;
    unit: string;
    grade: number;
    term: number;
    studentCount?: string;
    rank?: string;
    sameRank?: string;
    avgScore?: string;
    standardDeviation?: string;
    achievementRatio?: string;
    calculationDetail?: SubjectScoreCalculationDetail;

    constructor(data: {
        id: number;
        seqNumber: number;
        subjectName: string;
        subjectCode: string;
        subjectGroup?: string | null;
        subjectSeparationCode: string;
        rankingGrade: string;
        achievement: string;
        assessment?: string | null;
        originalScore?: number | null;
        unit: string;
        grade: number;
        term: number;
        studentCount?: string | null;
        rank?: string | null;
        sameRank?: string | null;
        avgScore?: string | null;
        standardDeviation?: string | null;
        achievementRatio?: string | null;
    }) {
        Object.assign(this, data);
    }
}

export class StudentScoreResult {
    id?: number;
    studentBaseInfoId: number;
    recruitmentSeasonId: number;
    finalScore: number;
    ranking?: number;
    calculationDate?: Date;
    finalFormula?: string;

    constructor(
        studentBaseInfoId: number,
        recruitmentSeasonId: number,
        finalScore: number,
        calculationDate: Date = new Date(),
        id?: number,
        ranking?: number,
        finalFormula?: string,
    ) {
        this.id = id;
        this.studentBaseInfoId = studentBaseInfoId;
        this.recruitmentSeasonId = recruitmentSeasonId;
        this.finalScore = finalScore;
        this.calculationDate = calculationDate;
        this.ranking = ranking;
        this.finalFormula = finalFormula;
    }

    static create(
        studentBaseInfoId: number,
        finalScore: number,
        ranking: number,
        finalFormula?: string,
    ): StudentScoreResult {
        return new StudentScoreResult(
            studentBaseInfoId,
            0, // recruitmentSeasonId - will be set later
            finalScore,
            new Date(),
            undefined,
            ranking,
            finalFormula,
        );
    }
}

export class SubjectScoreCalculationDetail {
    id?: number;
    subjectScoreId: number;
    isReflected: boolean;
    nonReflectionReason?: string | null;
    convertedScore?: number | null;
    convertedBaseValue?: string | null; // This matches the enum in schema
    conversionFormula?: string | null;
    calculationHandler: string;

    constructor(data: {
        subjectScoreId: number;
        isReflected: boolean;
        nonReflectionReason?: string | null;
        convertedScore?: number | null;
        convertedBaseValue?: string | null;
        conversionFormula?: string | null;
        calculationHandler: string;
        id?: number;
    }) {
        this.id = data.id;
        this.subjectScoreId = data.subjectScoreId;
        this.isReflected = data.isReflected;
        this.nonReflectionReason = data.nonReflectionReason;
        this.convertedScore = data.convertedScore;
        this.convertedBaseValue = data.convertedBaseValue;
        this.conversionFormula = data.conversionFormula;
        this.calculationHandler = data.calculationHandler;
    }

    static create(
        subjectScoreId: number,
        isReflected: boolean,
        nonReflectionReason?: string | null,
        convertedScore?: number,
        calculationHandler: string = 'Unknown',
    ): SubjectScoreCalculationDetail {
        return new SubjectScoreCalculationDetail({
            subjectScoreId,
            isReflected,
            nonReflectionReason,
            convertedScore,
            convertedBaseValue: null,
            conversionFormula: null,
            calculationHandler,
        });
    }
}
