import { SubjectScore } from './subject-score.entity';

/**
 * 수험생 기본 정보 엔터티
 */
export class StudentBaseInfo {
    readonly id: number;
    readonly recruitmentSeasonId: number;
    readonly recruitmentTypeCode: string;
    readonly recruitmentUnitCode: string;
    readonly identifyNumber: string;
    readonly socialNumber: string;
    readonly schoolCode: string;
    readonly collegeAdmissionYear: string;
    readonly seleScCode: string;
    readonly applicantScCode: string;
    readonly graduateYear: string;
    readonly graduateGrade: string;
    readonly masterSchoolYN: string;
    readonly specializedSchoolYN: string;
    readonly correctionRegisterYN: string;
    readonly examNumber: string;
    readonly uniqueFileName?: string;
    readonly pictureFileName?: string;
    readonly subjectScores: SubjectScore[];
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(params: {
        id: number;
        recruitmentSeasonId: number;
        recruitmentTypeCode: string;
        recruitmentUnitCode: string;
        identifyNumber: string;
        socialNumber: string;
        schoolCode: string;
        collegeAdmissionYear: string;
        seleScCode: string;
        applicantScCode: string;
        graduateYear: string;
        graduateGrade: string;
        masterSchoolYN: string;
        specializedSchoolYN: string;
        correctionRegisterYN: string;
        examNumber: string;
        uniqueFileName?: string;
        pictureFileName?: string;
        subjectScores?: SubjectScore[];
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = params.id;
        this.recruitmentSeasonId = params.recruitmentSeasonId;
        this.recruitmentTypeCode = params.recruitmentTypeCode;
        this.recruitmentUnitCode = params.recruitmentUnitCode;
        this.identifyNumber = params.identifyNumber;
        this.socialNumber = params.socialNumber;
        this.schoolCode = params.schoolCode;
        this.collegeAdmissionYear = params.collegeAdmissionYear;
        this.seleScCode = params.seleScCode;
        this.applicantScCode = params.applicantScCode;
        this.graduateYear = params.graduateYear;
        this.graduateGrade = params.graduateGrade;
        this.masterSchoolYN = params.masterSchoolYN;
        this.specializedSchoolYN = params.specializedSchoolYN;
        this.correctionRegisterYN = params.correctionRegisterYN;
        this.examNumber = params.examNumber;
        this.uniqueFileName = params.uniqueFileName;
        this.pictureFileName = params.pictureFileName;
        this.subjectScores = params.subjectScores || [];
        this.createdAt = params.createdAt;
        this.updatedAt = params.updatedAt;
    }

    static create(params: {
        recruitmentSeasonId: number;
        recruitmentTypeCode: string;
        recruitmentUnitCode: string;
        identifyNumber: string;
        socialNumber: string;
        schoolCode: string;
        collegeAdmissionYear: string;
        seleScCode: string;
        applicantScCode: string;
        graduateYear: string;
        graduateGrade: string;
        masterSchoolYN: string;
        specializedSchoolYN: string;
        correctionRegisterYN: string;
        examNumber: string;
        uniqueFileName?: string;
        pictureFileName?: string;
        subjectScores?: SubjectScore[];
    }): StudentBaseInfo {
        const now = new Date();
        return new StudentBaseInfo({
            id: 0, // Will be set by database
            ...params,
            createdAt: now,
            updatedAt: now,
        });
    }

    addSubjectScore(subjectScore: SubjectScore): StudentBaseInfo {
        const updatedScores = [...this.subjectScores, subjectScore];
        return new StudentBaseInfo({
            ...this,
            subjectScores: updatedScores,
            updatedAt: new Date(),
        });
    }

    getSubjectScoreCount(): number {
        return this.subjectScores.length;
    }
}
