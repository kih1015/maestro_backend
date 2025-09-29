import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiProduces } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/response.dto';

export function ExportScoresDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: 'Export scores to Excel',
            description: 'Export calculated scores for a recruitment season to Excel file',
        }),
        ApiQuery({
            name: 'recruitmentSeasonId',
            description: 'Recruitment season ID (required)',
            example: 1,
            type: Number,
        }),
        ApiResponse({
            status: 200,
            description: 'Excel file with score results',
            content: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                    schema: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        }),
        ApiResponse({
            status: 400,
            description: 'Validation failed',
            type: ErrorResponseDto,
        }),
        ApiResponse({ status: 401, description: 'Unauthorized' }),
        ApiResponse({ status: 500, description: 'Internal server error' }),
        ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    );
}
