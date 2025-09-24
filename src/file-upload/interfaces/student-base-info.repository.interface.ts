import { StudentBaseInfo } from '../entities/student-base-info.entity';

export interface StudentBaseInfoRepositoryInterface {
    saveMany(students: StudentBaseInfo[]): Promise<StudentBaseInfo[]>;
    findByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<StudentBaseInfo[]>;
    countByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<number>;
    deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void>;
    findById(id: number): Promise<StudentBaseInfo | null>;
    save(student: StudentBaseInfo): Promise<StudentBaseInfo>;
    delete(id: number): Promise<void>;
}
