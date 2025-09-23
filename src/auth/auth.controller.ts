import {
  Controller,
  Post,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
  ): Promise<{ user: UserResponseDto; accessToken: string }> {
    return this.authService.login(loginUserDto);
  }
}