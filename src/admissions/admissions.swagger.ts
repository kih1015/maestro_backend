import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RecruitmentSeasonResponseDto } from './dto/recruitment-season-response.dto';

export const AdmissionsControllerSwagger = applyDecorators(ApiTags('admissions'), ApiBearerAuth());

export const CreateRecruitmentSeasonSwagger = applyDecorators(
    ApiOperation({ summary: 'Create recruitment season' }),
    ApiResponse({
        status: 201,
        description: 'Recruitment season created successfully',
        type: RecruitmentSeasonResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Validation failed' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 409, description: 'Conflict - duplicate codes or names' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
);

export const GetRecruitmentSeasonsSwagger = applyDecorators(
    ApiOperation({ summary: 'Get recruitment seasons' }),
    ApiQuery({
        name: 'universityCode',
        required: false,
        description: 'Filter by university code',
        example: 'GACHON',
    }),
    ApiResponse({
        status: 200,
        description: 'Recruitment seasons retrieved successfully',
        type: [RecruitmentSeasonResponseDto],
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
);

export const GetRecruitmentSeasonByIdSwagger = applyDecorators(
    ApiOperation({ summary: 'Get recruitment season by ID' }),
    ApiParam({ name: 'id', description: 'Recruitment season ID', example: 1 }),
    ApiResponse({
        status: 200,
        description: 'Recruitment season retrieved successfully',
        type: RecruitmentSeasonResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Recruitment season not found' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
);

export const UpdateRecruitmentSeasonSwagger = applyDecorators(
    ApiOperation({ summary: 'Update recruitment season' }),
    ApiParam({ name: 'id', description: 'Recruitment season ID', example: 1 }),
    ApiResponse({
        status: 200,
        description: 'Recruitment season updated successfully',
        type: RecruitmentSeasonResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Validation failed' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Recruitment season not found' }),
    ApiResponse({ status: 409, description: 'Conflict - duplicate codes or names' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
);

export const DeleteRecruitmentSeasonSwagger = applyDecorators(
    ApiOperation({ summary: 'Delete recruitment season' }),
    ApiParam({ name: 'id', description: 'Recruitment season ID', example: 1 }),
    ApiResponse({
        status: 200,
        description: 'Recruitment season deleted successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Recruitment season not found' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
);
