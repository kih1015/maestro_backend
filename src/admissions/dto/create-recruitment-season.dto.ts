import { IsString, IsNotEmpty, ValidateNested, ArrayMinSize, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AdmissionPeriodDto } from './admission-period.dto';
import { AdmissionTypeDto } from './admission-type.dto';
import { RecruitmentUnitDto } from './recruitment-unit.dto';

/**
 * 새로운 모집 시즌 생성 요청을 위한 DTO 클래스
 * 대학 코드, 입학 기간, 전형 유형, 모집 단위 정보를 포함합니다.
 * 입력 데이터의 유효성 검증 규칙을 포함하고 있습니다.
 */
export class CreateRecruitmentSeasonDto {
    /** 대학 코드 (대문자와 숫자만 허용, 예: 'GACHON') */
    @ApiProperty({ example: 'GACHON', description: 'University code (uppercase letters and numbers)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z0-9]+$/, { message: 'University code must contain only uppercase letters and numbers' })
    universityCode: string;

    /** 입학 기간 정보 (연도 및 시기 이름) */
    @ApiProperty({ type: AdmissionPeriodDto, description: 'Admission period information' })
    @ValidateNested()
    @Type(() => AdmissionPeriodDto)
    admissionPeriod: AdmissionPeriodDto;

    /** 전형 유형 목록 (중복 불가, 최소 1개 이상) */
    @ApiProperty({ type: [AdmissionTypeDto], description: 'List of admission types (must be unique)' })
    @ValidateNested({ each: true })
    @Type(() => AdmissionTypeDto)
    @ArrayMinSize(1)
    admissionTypes: AdmissionTypeDto[];

    /** 모집 단위 목록 (중복 불가, 최소 1개 이상) */
    @ApiProperty({ type: [RecruitmentUnitDto], description: 'List of recruitment units (must be unique)' })
    @ValidateNested({ each: true })
    @Type(() => RecruitmentUnitDto)
    @ArrayMinSize(1)
    recruitmentUnits: RecruitmentUnitDto[];
}
