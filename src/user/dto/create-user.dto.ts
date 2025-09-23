import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'username123', description: 'Unique username' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'UNIV001', description: 'University code' })
    @IsString()
    @IsNotEmpty()
    universityCode: string;

    @ApiProperty({ example: 'password123', description: 'Password (minimum 6 characters)' })
    @IsString()
    @MinLength(6)
    password: string;
}
