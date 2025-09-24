import { Student } from '../entities/student.entity';
import { StudentFiltersDto } from '../dto/student-filters.dto';
import { SortOrder } from '../dto/list-students.dto';

export interface StudentFilters
    extends Omit<StudentFiltersDto, 'recruitmentSeasonId' | 'page' | 'pageSize' | 'q' | 'sort'> {}

export interface IStudentReadRepository {
    /**
     * Count total students in a recruitment season
     */
    countStudents(recruitmentSeasonId: number): Promise<number>;

    /**
     * Count students with calculation results in a recruitment season
     */
    countResultsForSeason(recruitmentSeasonId: number): Promise<number>;

    /**
     * Stream students in batches for calculation processing
     */
    streamStudents(recruitmentSeasonId: number, lastId: number | null, batchSize: number): Promise<Student[]>;

    /**
     * List students with pagination, filtering, and sorting
     */
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

    /**
     * Find student by identification number
     */
    findByIdentifyNumber(recruitmentSeasonId: number, identifyNumber: string): Promise<Student | null>;

    /**
     * Get export data for final scores
     */
    exportFinalScores(recruitmentSeasonId: number): Promise<Array<{ identityNumber: string; finalScore: number }>>;

    /**
     * Get student extra information (final formula, exam number)
     */
    getStudentExtraInfo(studentBaseInfoId: number): Promise<{
        finalFormula: string | null;
        examNumber: string | null;
    }>;
}
