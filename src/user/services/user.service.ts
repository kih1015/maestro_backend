import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async findById(id: number): Promise<UserResponseDto> {
        const user: User | null = await this.userRepository.findById(id);
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

    async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        await this.validateUserUniqueness(createUserDto);

        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

        const newUser = User.of({
            id: 0,
            email: createUserDto.email,
            username: createUserDto.username,
            universityCode: createUserDto.universityCode,
            hashedPassword: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const savedUser = await this.userRepository.create(newUser);

        return {
            id: savedUser.id,
            email: savedUser.email,
            username: savedUser.username,
            universityCode: savedUser.universityCode,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt,
        };
    }

    async authenticateUser(loginUserDto: LoginUserDto): Promise<User> {
        const user: User | null = await this.userRepository.findByEmail(loginUserDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        await user.verifyPassword(loginUserDto.password);
        return user;
    }

    private async validateUserUniqueness(createUserDto: CreateUserDto): Promise<void> {
        const existingUserByEmail = await this.userRepository.findByEmail(createUserDto.email);
        if (existingUserByEmail) {
            throw new ConflictException('Email already exists');
        }

        const existingUserByUsername = await this.userRepository.findByUsername(createUserDto.username);
        if (existingUserByUsername) {
            throw new ConflictException('Username already exists');
        }
    }
}
