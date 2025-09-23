import { ApiProperty } from '@nestjs/swagger';
import { AdmissionTypeDto } from './admission-type.dto';
import { RecruitmentUnitDto } from './recruitment-unit.dto';

export class RecruitmentSeasonResponseDto {
    @ApiProperty({ example: 1, description: 'Unique identifier for the recruitment season' })
    id: number;

    @ApiProperty({ example: 'GACHON', description: 'University code' })
    universityCode: string;

    @ApiProperty({ example: 2024, description: 'Year of admission' })
    admissionYear: number;

    @ApiProperty({ example: '정시', description: 'Name of the admission period' })
    admissionName: string;

    @ApiProperty({ type: [AdmissionTypeDto], description: 'List of admission types' })
    admissionTypes: AdmissionTypeDto[];

    @ApiProperty({ type: [RecruitmentUnitDto], description: 'List of recruitment units' })
    recruitmentUnits: RecruitmentUnitDto[];

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
    createdAt: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
    updatedAt: string;
}
