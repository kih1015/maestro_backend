import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'User successfully created', type: UserResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async register(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.authService.register(createUserDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiBody({ type: LoginUserDto })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged in',
        schema: {
            type: 'object',
            properties: {
                user: { $ref: '#/components/schemas/UserResponseDto' },
                accessToken: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(
        @Body(ValidationPipe) loginUserDto: LoginUserDto,
    ): Promise<{ user: UserResponseDto; accessToken: string }> {
        return this.authService.login(loginUserDto);
    }
}
