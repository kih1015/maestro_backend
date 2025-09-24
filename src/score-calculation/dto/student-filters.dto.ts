import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class StudentFiltersDto {
    @ApiPropertyOptional({
        description: 'Filter by graduation year (from)',
        example: '2022',
    })
    @IsOptional()
    @IsString()
    graduateYearFrom?: string;

    @ApiPropertyOptional({
        description: 'Filter by graduation year (to)',
        example: '2024',
    })
    @IsOptional()
    @IsString()
    graduateYearTo?: string;

    @ApiPropertyOptional({
        description: 'Filter by graduation grade',
        example: '1',
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    })
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as string[])
    graduateGrade?: string | string[];

    @ApiPropertyOptional({
        description: 'Filter by recruitment type code',
        example: '101',
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    })
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as string[])
    recruitmentTypeCode?: string | string[];

    @ApiPropertyOptional({
        description: 'Filter by recruitment unit code',
        example: '001',
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    })
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as string[])
    recruitmentUnitCode?: string | string[];

    @ApiPropertyOptional({
        description: 'Filter by applicant school code',
        example: 'A001',
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    })
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as string[])
    applicantScCode?: string | string[];

    @ApiPropertyOptional({
        description: 'Filter by calculation status',
        example: 'completed',
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    })
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]) as string[])
    calculationStatus?: string | string[];
}
