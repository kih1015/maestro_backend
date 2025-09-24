import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateScoresResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({
        example: { message: 'Started' },
        description: 'Response data with status message',
    })
    data: {
        message: 'Started' | 'Already running';
    };
}

export class SummaryResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({
        description: 'Summary statistics',
        example: {
            totalStudents: 150,
            totalResults: 120,
            studentsWithResults: 120,
        },
    })
    data: {
        totalStudents: number;
        totalResults: number;
        studentsWithResults: number;
    };
}

export class ApplicableSubjectDto {
    @ApiProperty({ example: 1 })
    seqNumber: number;

    @ApiProperty({ example: '수학' })
    subjectName: string;

    @ApiProperty({ example: 'MATH001' })
    subjectCode: string;

    @ApiPropertyOptional({ example: '수학' })
    subjectGroup?: string | null;

    @ApiProperty({ example: '001' })
    subjectSeparationCode: string;

    @ApiProperty({ example: '1' })
    rankingGrade: string;

    @ApiProperty({ example: 'A' })
    achievement: string;

    @ApiPropertyOptional({ example: 'A' })
    assessment?: string | null;

    @ApiPropertyOptional({ example: 85.5 })
    percentile?: number | null;

    @ApiPropertyOptional({ example: 90.0 })
    convertedScore?: number | null;

    @ApiPropertyOptional({ example: 100.0 })
    convertedBaseValue?: number | null;

    @ApiPropertyOptional({ example: '(grade * 0.9)' })
    conversionFormula?: string | null;

    @ApiProperty({ example: '4' })
    unit: string;

    @ApiProperty({ example: 3 })
    grade: number;

    @ApiProperty({ example: 1 })
    term: number;
}

export class ExcludedSubjectDto {
    @ApiProperty({ example: 2 })
    seqNumber: number;

    @ApiProperty({ example: '체육' })
    subjectName: string;

    @ApiProperty({ example: 'PE001' })
    subjectCode: string;

    @ApiPropertyOptional({ example: '예체능' })
    subjectGroup?: string | null;

    @ApiProperty({ example: '002' })
    subjectSeparationCode: string;

    @ApiProperty({ example: '예체능 과목 제외' })
    reason: string;

    @ApiPropertyOptional({ example: 'B' })
    assessment?: string | null;

    @ApiPropertyOptional({ example: 72.3 })
    percentile?: number | null;

    @ApiPropertyOptional({ example: null })
    convertedScore?: number | null;

    @ApiPropertyOptional({ example: null })
    convertedBaseValue?: number | null;

    @ApiPropertyOptional({ example: null })
    conversionFormula?: string | null;

    @ApiProperty({ example: '2' })
    unit: string;

    @ApiProperty({ example: 3 })
    grade: number;

    @ApiProperty({ example: 1 })
    term: number;
}

export class StudentListItemDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: '20240001' })
    identifyNumber: string;

    @ApiProperty({ example: 'E20240001' })
    examNumber: string;

    @ApiProperty({ example: '2024' })
    graduateYear: string;

    @ApiPropertyOptional({ example: '1' })
    graduateGrade?: string;

    @ApiProperty({ example: '101' })
    recruitmentTypeCode: string;

    @ApiPropertyOptional({ example: '일반전형' })
    recruitmentTypeName?: string;

    @ApiProperty({ example: '001' })
    recruitmentUnitCode: string;

    @ApiPropertyOptional({ example: '컴퓨터공학과' })
    recruitmentUnitName?: string;

    @ApiPropertyOptional({ example: 'A001' })
    applicantScCode?: string;

    @ApiPropertyOptional({ example: 85.5 })
    finalScore?: number;
}

export class ListStudentsResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({
        description: 'Paginated student list',
        example: {
            items: [
                {
                    id: 1,
                    identifyNumber: '20240001',
                    examNumber: 'E20240001',
                    graduateYear: '2024',
                    graduateGrade: '1',
                    recruitmentTypeCode: '101',
                    recruitmentTypeName: '일반전형',
                    recruitmentUnitCode: '001',
                    recruitmentUnitName: '컴퓨터공학과',
                    applicantScCode: 'A001',
                    finalScore: 85.5,
                },
            ],
            total: 150,
            completed: 120,
        },
    })
    data: {
        items: StudentListItemDto[];
        total: number;
        completed: number;
    };
}

export class StudentScoreDetailDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: '20240001' })
    identifyNumber: string;

    @ApiProperty({ example: '101' })
    recruitmentTypeCode: string;

    @ApiProperty({ example: '001' })
    recruitmentUnitCode: string;

    @ApiProperty({
        type: [ApplicableSubjectDto],
        description: 'Subjects included in score calculation',
    })
    applicableSubjects: ApplicableSubjectDto[];

    @ApiProperty({
        type: [ExcludedSubjectDto],
        description: 'Subjects excluded from score calculation',
    })
    excludedSubjects: ExcludedSubjectDto[];

    @ApiPropertyOptional({
        example: '수학: 90.0 + 영어: 85.0 = 175.0',
        description: 'Final calculation formula',
    })
    finalFormula?: string | null;
}

export class StudentScoreDetailResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ type: StudentScoreDetailDto })
    data: StudentScoreDetailDto;
}

export class ErrorResponseDto {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 'recruitmentSeasonId is required' })
    error: string;
}
