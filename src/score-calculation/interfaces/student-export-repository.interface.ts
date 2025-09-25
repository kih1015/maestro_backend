export interface IStudentExportRepository {
    exportFinalScores(recruitmentSeasonId: number): Promise<Array<{ identityNumber: string; finalScore: number }>>;
}
