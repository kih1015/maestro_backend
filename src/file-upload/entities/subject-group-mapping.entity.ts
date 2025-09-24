/**
 * 과목군 매핑 엔터티
 */
export class SubjectGroupMapping {
    readonly id: number;
    readonly recruitmentSeasonId: number;
    readonly rowNo?: number;
    readonly category?: string;
    readonly subjectGroup: string;
    readonly curriculumCode?: string;
    readonly curriculumName?: string;
    readonly courseCode?: string;
    readonly courseName?: string;
    readonly subjectCode?: string;
    readonly subjectName?: string;
    readonly requiredYn?: string;
    readonly includedYn?: string;
    readonly note?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(params: {
        id: number;
        recruitmentSeasonId: number;
        rowNo?: number;
        category?: string;
        subjectGroup: string;
        curriculumCode?: string;
        curriculumName?: string;
        courseCode?: string;
        courseName?: string;
        subjectCode?: string;
        subjectName?: string;
        requiredYn?: string;
        includedYn?: string;
        note?: string;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = params.id;
        this.recruitmentSeasonId = params.recruitmentSeasonId;
        this.rowNo = params.rowNo;
        this.category = params.category;
        this.subjectGroup = params.subjectGroup;
        this.curriculumCode = params.curriculumCode;
        this.curriculumName = params.curriculumName;
        this.courseCode = params.courseCode;
        this.courseName = params.courseName;
        this.subjectCode = params.subjectCode;
        this.subjectName = params.subjectName;
        this.requiredYn = params.requiredYn;
        this.includedYn = params.includedYn;
        this.note = params.note;
        this.createdAt = params.createdAt;
        this.updatedAt = params.updatedAt;
    }

    static create(params: {
        recruitmentSeasonId: number;
        rowNo?: number;
        category?: string;
        subjectGroup: string;
        curriculumCode?: string;
        curriculumName?: string;
        courseCode?: string;
        courseName?: string;
        subjectCode?: string;
        subjectName?: string;
        requiredYn?: string;
        includedYn?: string;
        note?: string;
    }): SubjectGroupMapping {
        const now = new Date();
        return new SubjectGroupMapping({
            id: 0, // Will be set by database
            ...params,
            createdAt: now,
            updatedAt: now,
        });
    }
}
