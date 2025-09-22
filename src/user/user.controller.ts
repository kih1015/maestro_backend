import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
  ): Promise<{ user: UserResponseDto; accessToken: string }> {
    return this.userService.login(loginUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Request() req: { user: { sub: number } },
  ): Promise<UserResponseDto> {
    return this.userService.findById(req.user.sub);
  }
}
