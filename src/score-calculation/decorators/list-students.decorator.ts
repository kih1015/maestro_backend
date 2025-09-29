import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ListStudentsResponseDto, ErrorResponseDto } from '../dto/response.dto';

export function ListStudentsDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: 'List students with scores',
            description: 'Get a paginated list of students with their calculated scores',
        }),
        ApiQuery({
            name: 'recruitmentSeasonId',
            description: 'Recruitment season ID (required)',
            example: 1,
            type: Number,
        }),
        ApiQuery({
            name: 'page',
            description: 'Page number for pagination',
            example: 1,
            required: false,
            type: Number,
        }),
        ApiQuery({
            name: 'pageSize',
            description: 'Number of items per page (max 100)',
            example: 10,
            required: false,
            type: Number,
        }),
        ApiQuery({
            name: 'q',
            description: 'Search query for student identification number or exam number',
            example: '20240001',
            required: false,
            type: String,
        }),
        ApiResponse({
            status: 200,
            description: 'Students with scores retrieved successfully',
            type: ListStudentsResponseDto,
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
