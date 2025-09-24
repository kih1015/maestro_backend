import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSummaryDto {
    @ApiProperty({
        description: 'Recruitment season ID (required)',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    recruitmentSeasonId: number;
}
