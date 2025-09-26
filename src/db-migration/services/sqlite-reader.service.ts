import { Injectable } from '@nestjs/common';
import { Database } from 'sqlite3';

export interface SqliteStudentBaseInfo {
    rowid?: number;
    Mogib2: string;
    IdentifyNumber: string;
    SocialNumber: string;
    SchoolCode: string;
    CollegeAdmissionYear: string;
    SeleScCode: string;
    ApplicantScCode: string;
    GraduateYear: string;
    GraduateGrade: string;
    MasterSchoolYN: string;
    SpecializedSchoolYN: string;
    CorrectionRegisterYN: string;
    ExamNumber: string;
    UniqueFileName?: string;
    PictureFileName?: string;
}

export interface SqliteSubjectScore {
    rowid?: number;
    Mogib2: string;
    IdentifyNumber: string;
    SeqNumber: number;
    SocialNumber: string;
    SchoolCode: string;
    Year: string;
    Grade: number;
    OrganizationCode: string;
    OrganizationName: string;
    CourceCode: string;
    CourceName: string;
    SubjectCode: string;
    SubjectName: string;
    Term: number;
    Unit?: string;
    Assessment?: string;
    Rank?: string;
    SameRank?: string;
    StudentCount?: string;
    OriginalScore?: string;
    AvgScore?: string;
    StandardDeviation?: string;
    RankingGrade?: string;
    RankingGradeCode?: string;
    Achievement?: string;
    AchievementCode?: string;
    AchievementRatio?: string;
    SubjectSeparationCode?: string;
}

@Injectable()
export class SqliteReaderService {
    async openDatabase(filePath: string): Promise<Database> {
        return new Promise((resolve, reject) => {
            const db = new Database(filePath, err => {
                if (err) {
                    reject(new Error(`Failed to open SQLite database: ${err.message}`));
                } else {
                    resolve(db);
                }
            });
        });
    }

    async closeDatabase(db: Database): Promise<void> {
        return new Promise(resolve => {
            db.close(() => {
                resolve();
            });
        });
    }

    async getTableCount(db: Database, tableName: string): Promise<number> {
        return new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row: { count: number }) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    async queryStudentBatch(db: Database, lastRowId: number, pageSize: number): Promise<SqliteStudentBaseInfo[]> {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT rowid as rowid, * FROM StudentBaseInfo WHERE rowid > ? ORDER BY rowid LIMIT ?`,
                [lastRowId, pageSize],
                (err, results: SqliteStudentBaseInfo[]) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results || []);
                    }
                },
            );
        });
    }

    async querySubjectScoreBatch(db: Database, lastRowId: number, pageSize: number): Promise<SqliteSubjectScore[]> {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT rowid as rowid, * FROM SubjectScore WHERE rowid > ? ORDER BY rowid LIMIT ?`,
                [lastRowId, pageSize],
                (err, results: SqliteSubjectScore[]) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results || []);
                    }
                },
            );
        });
    }
}
