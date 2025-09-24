import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadExcelRequestDto {
    @ApiProperty({
        description: 'Recruitment season ID',
        example: 1,
    })
    @IsNumber()
    @IsPositive()
    @Transform(({ value }) => Number(value))
    readonly recruitmentSeasonId: number;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Excel file to upload',
    })
    readonly file: Express.Multer.File;
}
