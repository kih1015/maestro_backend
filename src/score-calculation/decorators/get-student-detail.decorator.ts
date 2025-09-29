import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StudentScoreDetailResponseDto, ErrorResponseDto } from '../dto/response.dto';

export function GetStudentDetailDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get student score detail',
            description: 'Get detailed score calculation information for a specific student',
        }),
        ApiQuery({
            name: 'recruitmentSeasonId',
            description: 'Recruitment season ID (required)',
            example: 1,
            type: Number,
        }),
        ApiQuery({
            name: 'identifyNumber',
            description: 'Student identification number (required)',
            example: '20240001',
            type: String,
        }),
        ApiResponse({
            status: 200,
            description: 'Student score detail retrieved successfully',
            type: StudentScoreDetailResponseDto,
        }),
        ApiResponse({
            status: 400,
            description: 'Validation failed',
            type: ErrorResponseDto,
        }),
        ApiResponse({
            status: 404,
            description: 'Student not found',
            type: ErrorResponseDto,
        }),
        ApiResponse({ status: 401, description: 'Unauthorized' }),
        ApiResponse({ status: 500, description: 'Internal server error' }),
    );
}
