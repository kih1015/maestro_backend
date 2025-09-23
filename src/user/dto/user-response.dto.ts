import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({ example: 1, description: 'User ID' })
    id: number;

    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    email: string;

    @ApiProperty({ example: 'username123', description: 'Username' })
    username: string;

    @ApiProperty({ example: 'UNIV001', description: 'University code' })
    universityCode: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update date' })
    updatedAt: Date;
}
