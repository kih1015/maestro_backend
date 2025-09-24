import { ApiProperty } from '@nestjs/swagger';

export class FileUploadSummaryDto {
    @ApiProperty({
        description: 'Recruitment season ID',
        example: 1,
    })
    readonly recruitmentSeasonId: number;

    @ApiProperty({
        description: 'Total number of students',
        example: 1500,
    })
    readonly totalStudents: number;

    @ApiProperty({
        description: 'Total number of subject scores',
        example: 15000,
    })
    readonly totalSubjectScores: number;

    @ApiProperty({
        description: 'Upload timestamp',
        example: '2024-01-15T10:30:00Z',
    })
    readonly uploadedAt: string;

    constructor(params: {
        recruitmentSeasonId: number;
        totalStudents: number;
        totalSubjectScores: number;
        uploadedAt: string;
    }) {
        this.recruitmentSeasonId = params.recruitmentSeasonId;
        this.totalStudents = params.totalStudents;
        this.totalSubjectScores = params.totalSubjectScores;
        this.uploadedAt = params.uploadedAt;
    }
}
