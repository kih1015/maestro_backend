import { Student } from '../entities/student.entity';
import { StudentFilters } from './student-read-repository.interface';
import { SortOrder } from '../dto/list-students.dto';

export interface IStudentQueryRepository {
    listStudents(
        recruitmentSeasonId: number,
        page: number,
        pageSize: number,
        query?: string,
        filters?: StudentFilters,
        sort?: SortOrder,
    ): Promise<{
        items: Array<{
            id: number;
            identifyNumber: string;
            examNumber: string;
            graduateYear: string;
            graduateGrade?: string;
            recruitmentTypeCode: string;
            recruitmentTypeName?: string;
            recruitmentUnitCode: string;
            recruitmentUnitName?: string;
            applicantScCode?: string;
            finalScore?: number;
        }>;
        total: number;
        completed: number;
    }>;

    findByIdentifyNumber(recruitmentSeasonId: number, identifyNumber: string): Promise<Student | null>;

    getStudentExtraInfo(studentBaseInfoId: number): Promise<{
        finalFormula: string | null;
        examNumber: string | null;
    }>;
}
