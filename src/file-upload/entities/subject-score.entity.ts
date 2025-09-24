/**
 * 과목 성적 엔터티
 */
export class SubjectScore {
    readonly id: number;
    readonly studentBaseInfoId: number;
    readonly seqNumber: number;
    readonly socialNumber: string;
    readonly schoolCode: string;
    readonly year: string;
    readonly grade: number;
    readonly organizationCode: string;
    readonly organizationName: string;
    readonly courseCode: string;
    readonly courseName: string;
    readonly subjectCode: string;
    readonly subjectName: string;
    readonly term: number;
    readonly unit?: string;
    readonly assessment?: string;
    readonly rank?: string;
    readonly sameRank?: string;
    readonly studentCount?: string;
    readonly originalScore?: string;
    readonly avgScore?: string;
    readonly standardDeviation?: string;
    readonly rankingGrade?: string;
    readonly rankingGradeCode?: string;
    readonly achievement?: string;
    readonly achievementCode?: string;
    readonly achievementRatio?: string;
    readonly subjectSeparationCode?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(params: {
        id: number;
        studentBaseInfoId: number;
        seqNumber: number;
        socialNumber: string;
        schoolCode: string;
        year: string;
        grade: number;
        organizationCode: string;
        organizationName: string;
        courseCode: string;
        courseName: string;
        subjectCode: string;
        subjectName: string;
        term: number;
        unit?: string;
        assessment?: string;
        rank?: string;
        sameRank?: string;
        studentCount?: string;
        originalScore?: string;
        avgScore?: string;
        standardDeviation?: string;
        rankingGrade?: string;
        rankingGradeCode?: string;
        achievement?: string;
        achievementCode?: string;
        achievementRatio?: string;
        subjectSeparationCode?: string;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = params.id;
        this.studentBaseInfoId = params.studentBaseInfoId;
        this.seqNumber = params.seqNumber;
        this.socialNumber = params.socialNumber;
        this.schoolCode = params.schoolCode;
        this.year = params.year;
        this.grade = params.grade;
        this.organizationCode = params.organizationCode;
        this.organizationName = params.organizationName;
        this.courseCode = params.courseCode;
        this.courseName = params.courseName;
        this.subjectCode = params.subjectCode;
        this.subjectName = params.subjectName;
        this.term = params.term;
        this.unit = params.unit;
        this.assessment = params.assessment;
        this.rank = params.rank;
        this.sameRank = params.sameRank;
        this.studentCount = params.studentCount;
        this.originalScore = params.originalScore;
        this.avgScore = params.avgScore;
        this.standardDeviation = params.standardDeviation;
        this.rankingGrade = params.rankingGrade;
        this.rankingGradeCode = params.rankingGradeCode;
        this.achievement = params.achievement;
        this.achievementCode = params.achievementCode;
        this.achievementRatio = params.achievementRatio;
        this.subjectSeparationCode = params.subjectSeparationCode;
        this.createdAt = params.createdAt;
        this.updatedAt = params.updatedAt;
    }

    static create(params: {
        studentBaseInfoId: number;
        seqNumber: number;
        socialNumber: string;
        schoolCode: string;
        year: string;
        grade: number;
        organizationCode: string;
        organizationName: string;
        courseCode: string;
        courseName: string;
        subjectCode: string;
        subjectName: string;
        term: number;
        unit?: string;
        assessment?: string;
        rank?: string;
        sameRank?: string;
        studentCount?: string;
        originalScore?: string;
        avgScore?: string;
        standardDeviation?: string;
        rankingGrade?: string;
        rankingGradeCode?: string;
        achievement?: string;
        achievementCode?: string;
        achievementRatio?: string;
        subjectSeparationCode?: string;
    }): SubjectScore {
        const now = new Date();
        return new SubjectScore({
            id: 0, // Will be set by database
            ...params,
            createdAt: now,
            updatedAt: now,
        });
    }
}
