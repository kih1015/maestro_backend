import { ApiProperty } from '@nestjs/swagger';

export class SubjectGroupMappingSummaryDto {
    @ApiProperty({
        description: 'Recruitment season ID',
        example: 1,
    })
    readonly recruitmentSeasonId: number;

    @ApiProperty({
        description: 'Total number of mapping rows',
        example: 150,
    })
    readonly totalRows: number;

    @ApiProperty({
        description: 'Upload timestamp',
        example: '2024-01-15T10:30:00Z',
    })
    readonly uploadedAt: string;
}
