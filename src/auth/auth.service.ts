import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../user/user.repository';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUserByEmail = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingUserByUsername = await this.userRepository.findByUsername(
      createUserDto.username,
    );
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    const user = await this.userRepository.create({
      ...createUserDto,
      hashedPassword,
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      universityCode: user.universityCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ user: UserResponseDto; accessToken: string }> {
    const user = await this.userRepository.findByEmail(loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.hashedPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        universityCode: user.universityCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    };
  }

  async validateUser(payload: { sub: number; email: string }) {
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { sub: user.id, email: user.email };
  }
}