import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecruitmentUnitDto {
    @ApiProperty({ example: '컴퓨터공학과', description: 'Name of the recruitment unit (department/major)' })
    @IsString()
    @IsNotEmpty()
    unitName: string;

    @ApiProperty({ example: 101, description: 'Unique code for the recruitment unit' })
    @IsNumber()
    @Min(1)
    unitCode: number;
}
