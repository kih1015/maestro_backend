import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
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

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      universityCode: user.universityCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
