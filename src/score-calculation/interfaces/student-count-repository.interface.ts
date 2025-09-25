export interface IStudentCountRepository {
    countStudents(recruitmentSeasonId: number): Promise<number>;
    countResultsForSeason(recruitmentSeasonId: number): Promise<number>;
}
