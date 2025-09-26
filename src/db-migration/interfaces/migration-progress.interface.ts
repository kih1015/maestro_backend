export interface MigrationProgress {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    percentage: number;
    message: string;
    processedRecords?: number;
    totalRecords?: number;
    error?: string;
}

export interface MigrationResult {
    totalStudents: number;
    totalSubjectScores: number;
    completedAt: Date;
}
