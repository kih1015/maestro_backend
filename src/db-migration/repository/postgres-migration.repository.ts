import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export interface PostgresStudentBaseInfo {
    id?: number;
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
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PostgresSubjectScore {
    id?: number;
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
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class PostgresMigrationRepository {
    private pool: Pool;

    constructor(private configService: ConfigService) {
        this.pool = new Pool({
            connectionString: this.configService.get<string>('DATABASE_URL'),
        });
    }

    async clearExistingData(recruitmentSeasonId: number): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Delete subject scores first (due to foreign key constraint)
            await client.query(
                `
        DELETE FROM subject_scores
        WHERE "studentBaseInfoId" IN (
          SELECT id FROM student_base_infos
          WHERE "recruitmentSeasonId" = $1
        )
      `,
                [recruitmentSeasonId],
            );

            // Delete student base info
            await client.query(
                `
        DELETE FROM student_base_infos
        WHERE "recruitmentSeasonId" = $1
      `,
                [recruitmentSeasonId],
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async insertStudentBaseInfoBatch(students: PostgresStudentBaseInfo[]): Promise<PostgresStudentBaseInfo[]> {
        if (students.length === 0) return [];

        const client = await this.pool.connect();
        try {
            const values = students
                .map((student, index) => {
                    const paramOffset = index * 18;
                    return `($${paramOffset + 1}, $${paramOffset + 2}, $${paramOffset + 3}, $${paramOffset + 4}, $${paramOffset + 5}, $${paramOffset + 6}, $${paramOffset + 7}, $${paramOffset + 8}, $${paramOffset + 9}, $${paramOffset + 10}, $${paramOffset + 11}, $${paramOffset + 12}, $${paramOffset + 13}, $${paramOffset + 14}, $${paramOffset + 15}, $${paramOffset + 16}, $${paramOffset + 17}, $${paramOffset + 18})`;
                })
                .join(', ');

            const params: any[] = [];
            students.forEach(student => {
                params.push(
                    student.recruitmentSeasonId,
                    student.recruitmentTypeCode,
                    student.recruitmentUnitCode,
                    student.identifyNumber,
                    student.socialNumber,
                    student.schoolCode,
                    student.collegeAdmissionYear,
                    student.seleScCode,
                    student.applicantScCode,
                    student.graduateYear,
                    student.graduateGrade,
                    student.masterSchoolYN,
                    student.specializedSchoolYN,
                    student.correctionRegisterYN,
                    student.examNumber,
                    student.uniqueFileName,
                    student.pictureFileName,
                    new Date(), // updatedAt
                );
            });

            const query = `
        INSERT INTO student_base_infos (
          "recruitmentSeasonId", "recruitmentTypeCode", "recruitmentUnitCode",
          "identifyNumber", "socialNumber", "schoolCode", "collegeAdmissionYear",
          "seleScCode", "applicantScCode", "graduateYear", "graduateGrade",
          "masterSchoolYN", "specializedSchoolYN", "correctionRegisterYN",
          "examNumber", "uniqueFileName", "pictureFileName", "updatedAt"
        ) VALUES ${values}
        RETURNING id, "recruitmentTypeCode", "recruitmentUnitCode", "identifyNumber"
      `;

            const result = await client.query(query, params);
            return result.rows as (PostgresStudentBaseInfo & { id: number })[];
        } finally {
            client.release();
        }
    }

    async insertSubjectScoreBatch(scores: PostgresSubjectScore[]): Promise<void> {
        if (scores.length === 0) return;

        const client = await this.pool.connect();
        try {
            const values = scores
                .map((score, index) => {
                    const paramOffset = index * 28;
                    const params = Array.from({ length: 28 }, (_, i) => `$${paramOffset + i + 1}`);
                    return `(${params.join(', ')})`;
                })
                .join(', ');

            const params: any[] = [];
            scores.forEach(score => {
                params.push(
                    score.studentBaseInfoId,
                    score.seqNumber,
                    score.socialNumber,
                    score.schoolCode,
                    score.year,
                    score.grade,
                    score.organizationCode,
                    score.organizationName,
                    score.courseCode,
                    score.courseName,
                    score.subjectCode,
                    score.subjectName,
                    score.term,
                    score.unit,
                    score.assessment,
                    score.rank,
                    score.sameRank,
                    score.studentCount,
                    score.originalScore,
                    score.avgScore,
                    score.standardDeviation,
                    score.rankingGrade,
                    score.rankingGradeCode,
                    score.achievement,
                    score.achievementCode,
                    score.achievementRatio,
                    score.subjectSeparationCode,
                    new Date(), // updatedAt
                );
            });

            const query = `
        INSERT INTO subject_scores (
          "studentBaseInfoId", "seqNumber", "socialNumber", "schoolCode", "year",
          "grade", "organizationCode", "organizationName", "courseCode", "courseName",
          "subjectCode", "subjectName", "term", "unit", "assessment", "rank",
          "sameRank", "studentCount", "originalScore", "avgScore", "standardDeviation",
          "rankingGrade", "rankingGradeCode", "achievement", "achievementCode",
          "achievementRatio", "subjectSeparationCode", "updatedAt"
        ) VALUES ${values}
      `;

            await client.query(query, params);
        } finally {
            client.release();
        }
    }

    async getStudentCount(recruitmentSeasonId: number): Promise<number> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                `
        SELECT COUNT(*) as count
        FROM student_base_infos
        WHERE "recruitmentSeasonId" = $1
      `,
                [recruitmentSeasonId],
            );

            return parseInt((result.rows[0] as { count: string }).count);
        } finally {
            client.release();
        }
    }

    async getSubjectScoreCount(recruitmentSeasonId: number): Promise<number> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                `
        SELECT COUNT(*) as count
        FROM subject_scores s
        JOIN student_base_infos sb ON s."studentBaseInfoId" = sb.id
        WHERE sb."recruitmentSeasonId" = $1
      `,
                [recruitmentSeasonId],
            );

            return parseInt((result.rows[0] as { count: string }).count);
        } finally {
            client.release();
        }
    }

    async onModuleDestroy() {
        await this.pool.end();
    }
}
