import { IsNumber, IsString, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdmissionPeriodDto {
    @ApiProperty({ example: 2024, description: 'Year of admission' })
    @IsNumber()
    @Min(2000)
    @Max(2099)
    admissionYear: number;

    @ApiProperty({ example: '정시', description: 'Name of the admission period (수시, 정시, etc.)' })
    @IsString()
    @IsNotEmpty()
    admissionName: string;
}
