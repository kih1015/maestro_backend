import { ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AdmissionPeriodDto } from './admission-period.dto';
import { AdmissionTypeDto } from './admission-type.dto';
import { RecruitmentUnitDto } from './recruitment-unit.dto';

/**
 * 모집 시즌 수정 요청을 위한 DTO 클래스
 * 기존 모집 시즌의 입학 기간, 전형 유형, 모집 단위 정보를 수정할 때 사용됩니다.
 * 대학 코드와 ID는 변경할 수 없습니다.
 */
export class UpdateRecruitmentSeasonDto {
    /** 수정할 입학 기간 정보 (연도 및 시기 이름) */
    @ApiProperty({ type: AdmissionPeriodDto, description: 'Admission period information' })
    @ValidateNested()
    @Type(() => AdmissionPeriodDto)
    admissionPeriod: AdmissionPeriodDto;

    /** 수정할 전형 유형 목록 (중복 불가, 최소 1개 이상) */
    @ApiProperty({ type: [AdmissionTypeDto], description: 'List of admission types (must be unique)' })
    @ValidateNested({ each: true })
    @Type(() => AdmissionTypeDto)
    @ArrayMinSize(1)
    admissionTypes: AdmissionTypeDto[];

    /** 수정할 모집 단위 목록 (중복 불가, 최소 1개 이상) */
    @ApiProperty({ type: [RecruitmentUnitDto], description: 'List of recruitment units (must be unique)' })
    @ValidateNested({ each: true })
    @Type(() => RecruitmentUnitDto)
    @ArrayMinSize(1)
    recruitmentUnits: RecruitmentUnitDto[];
}
