import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class CalculateScoresDto {
    @ApiProperty({
        description: 'Recruitment season ID to calculate scores for',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @IsPositive()
    @Transform(({ value }) => parseInt(value))
    recruitmentSeasonId: number;
}
