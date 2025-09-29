import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalculateScoresResponseDto, ErrorResponseDto } from '../dto/response.dto';

export function CalculateScoresDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: 'Calculate scores',
            description: 'Start score calculation process for a recruitment season',
        }),
        ApiResponse({
            status: 200,
            description: 'Score calculation started or already running',
            type: CalculateScoresResponseDto,
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
