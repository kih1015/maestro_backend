import { ApiProperty } from '@nestjs/swagger';

export class UploadProgressDto {
    @ApiProperty({
        description: 'Upload status',
        enum: ['pending', 'uploading', 'processing', 'completed', 'failed'],
        example: 'processing',
    })
    readonly status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';

    @ApiProperty({
        description: 'Progress percentage (0-100)',
        example: 75,
    })
    readonly percentage: number;

    @ApiProperty({
        description: 'Status message',
        example: 'Processing 750 of 1000 records',
    })
    readonly message: string;

    @ApiProperty({
        description: 'Number of processed records',
        example: 750,
    })
    readonly processedRecords: number;

    @ApiProperty({
        description: 'Total number of records',
        example: 1000,
    })
    readonly totalRecords: number;

    @ApiProperty({
        description: 'Error message (if status is failed)',
        example: 'Database connection error',
        required: false,
    })
    readonly error?: string;

    @ApiProperty({
        description: 'Timestamp',
        example: '2024-01-15T10:30:00Z',
    })
    readonly timestamp: string;

    constructor(params: {
        status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
        percentage: number;
        message: string;
        processedRecords: number;
        totalRecords: number;
        error?: string;
        timestamp: string;
    }) {
        this.status = params.status;
        this.percentage = params.percentage;
        this.message = params.message;
        this.processedRecords = params.processedRecords;
        this.totalRecords = params.totalRecords;
        this.error = params.error;
        this.timestamp = params.timestamp;
    }
}
