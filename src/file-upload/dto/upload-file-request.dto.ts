import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadFileRequestDto {
    @ApiProperty({
        description: 'Recruitment season ID',
        example: 1,
    })
    @IsNumber()
    @IsPositive()
    @Transform(({ value }) => Number(value))
    readonly recruitmentSeasonId: number;

    @ApiProperty({
        description: 'File name',
        example: 'student_data.db3',
    })
    @IsString()
    readonly fileName: string;

    @ApiProperty({
        description: 'File size in bytes',
        example: 1024000,
    })
    @IsNumber()
    @IsPositive()
    readonly fileSize: number;

    @ApiProperty({
        description: 'Temporary file path (optional)',
        example: '/tmp/upload_123456789.db3',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly tempFilePath?: string;
}
