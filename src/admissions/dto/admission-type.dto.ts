import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdmissionTypeDto {
    @ApiProperty({ example: '일반전형', description: 'Name of the admission type' })
    @IsString()
    @IsNotEmpty()
    typeName: string;

    @ApiProperty({ example: 1, description: 'Unique code for the admission type' })
    @IsNumber()
    @Min(1)
    typeCode: number;
}
