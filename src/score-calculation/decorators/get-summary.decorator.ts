import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SummaryResponseDto, ErrorResponseDto } from '../dto/response.dto';

export function GetSummaryDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get calculation summary',
            description: 'Get summary statistics for score calculation in a recruitment season',
        }),
        ApiQuery({
            name: 'recruitmentSeasonId',
            description: 'Recruitment season ID (required)',
            example: 1,
            type: Number,
        }),
        ApiResponse({
            status: 200,
            description: 'Summary retrieved successfully',
            type: SummaryResponseDto,
        }),
        ApiResponse({
            status: 400,
            description: 'Validation failed',
            type: ErrorResponseDto,
        }),
        ApiResponse({ status: 401, description: 'Unauthorized' }),
        ApiResponse({ status: 500, description: 'Internal server error' }),
    );
}
