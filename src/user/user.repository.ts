import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IUserRepository } from './interfaces/user-repository.interface';
import { User } from './user.domain';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    return user ? User.of(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.users.findUnique({
      where: { username },
    });
    return user ? User.of(user) : null;
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });
    return user ? User.of(user) : null;
  }

  async create(
    createUserDto: CreateUserDto & { hashedPassword: string },
  ): Promise<User> {
    const { password, ...userData } = createUserDto;
    const user = await this.prisma.users.create({
      data: {
        ...userData,
        hashedPassword: createUserDto.hashedPassword,
        updatedAt: new Date(),
      },
    });
    return User.of(user);
  }
}
