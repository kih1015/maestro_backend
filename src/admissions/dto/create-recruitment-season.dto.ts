import { IsString, IsNotEmpty, ValidateNested, ArrayMinSize, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AdmissionPeriodDto } from './admission-period.dto';
import { AdmissionTypeDto } from './admission-type.dto';
import { RecruitmentUnitDto } from './recruitment-unit.dto';

export class CreateRecruitmentSeasonDto {
    @ApiProperty({ example: 'GACHON', description: 'University code (uppercase letters and numbers)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z0-9]+$/, { message: 'University code must contain only uppercase letters and numbers' })
    universityCode: string;

    @ApiProperty({ type: AdmissionPeriodDto, description: 'Admission period information' })
    @ValidateNested()
    @Type(() => AdmissionPeriodDto)
    admissionPeriod: AdmissionPeriodDto;

    @ApiProperty({ type: [AdmissionTypeDto], description: 'List of admission types (must be unique)' })
    @ValidateNested({ each: true })
    @Type(() => AdmissionTypeDto)
    @ArrayMinSize(1)
    admissionTypes: AdmissionTypeDto[];

    @ApiProperty({ type: [RecruitmentUnitDto], description: 'List of recruitment units (must be unique)' })
    @ValidateNested({ each: true })
    @Type(() => RecruitmentUnitDto)
    @ArrayMinSize(1)
    recruitmentUnits: RecruitmentUnitDto[];
}
