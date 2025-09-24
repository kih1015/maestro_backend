import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { StudentFiltersDto } from './student-filters.dto';

export enum SortOrder {
    SCORE_ASC = 'score_asc',
    SCORE_DESC = 'score_desc',
}

export class ListStudentsDto extends StudentFiltersDto {
    @ApiProperty({
        description: 'Recruitment season ID (required)',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @IsPositive()
    @Transform(({ value }) => parseInt(value as string))
    recruitmentSeasonId: number;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Transform(({ value }) => (value ? parseInt(value as string) : 1))
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page (max 100)',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Transform(({ value }) => (value ? parseInt(value as string) : 10))
    pageSize?: number = 10;

    @ApiPropertyOptional({
        description: 'Search query for student identification number or exam number',
        example: '20240001',
    })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.SCORE_DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sort?: SortOrder;
}
