import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetStudentDetailDto {
    @ApiProperty({
        description: 'Recruitment season ID (required)',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @IsPositive()
    @Transform(({ value }) => parseInt(value as string))
    recruitmentSeasonId: number;

    @ApiProperty({
        description: 'Student identification number (required)',
        example: '20240001',
    })
    @IsString()
    @IsNotEmpty()
    identifyNumber: string;
}
