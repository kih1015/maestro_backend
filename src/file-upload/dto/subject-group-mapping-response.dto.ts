import { ApiProperty } from '@nestjs/swagger';

export class SubjectGroupMappingResponseDto {
    @ApiProperty({
        description: 'Mapping ID',
        example: 1,
    })
    readonly id: number;

    @ApiProperty({
        description: 'Recruitment season ID',
        example: 1,
    })
    readonly recruitmentSeasonId: number;

    @ApiProperty({
        description: 'Row number',
        example: 1,
        required: false,
    })
    readonly rowNo?: number;

    @ApiProperty({
        description: 'Category',
        example: '교과',
        required: false,
    })
    readonly category?: string;

    @ApiProperty({
        description: 'Subject group',
        example: '국어',
    })
    readonly subjectGroup: string;

    @ApiProperty({
        description: 'Curriculum code',
        example: 'KOR001',
        required: false,
    })
    readonly curriculumCode?: string;

    @ApiProperty({
        description: 'Curriculum name',
        example: '국어I',
        required: false,
    })
    readonly curriculumName?: string;

    @ApiProperty({
        description: 'Course code',
        example: 'C001',
        required: false,
    })
    readonly courseCode?: string;

    @ApiProperty({
        description: 'Course name',
        example: '국어과',
        required: false,
    })
    readonly courseName?: string;

    @ApiProperty({
        description: 'Subject code',
        example: 'S001',
        required: false,
    })
    readonly subjectCode?: string;

    @ApiProperty({
        description: 'Subject name',
        example: '국어I',
        required: false,
    })
    readonly subjectName?: string;

    @ApiProperty({
        description: 'Required flag',
        example: 'Y',
        required: false,
    })
    readonly requiredYn?: string;

    @ApiProperty({
        description: 'Included flag',
        example: 'Y',
        required: false,
    })
    readonly includedYn?: string;

    @ApiProperty({
        description: 'Note',
        example: '필수과목',
        required: false,
    })
    readonly note?: string;

    @ApiProperty({
        description: 'Created timestamp',
        example: '2024-01-15T10:30:00Z',
    })
    readonly createdAt: string;

    @ApiProperty({
        description: 'Updated timestamp',
        example: '2024-01-15T10:30:00Z',
    })
    readonly updatedAt: string;
}
