import type { users as PrismaUser } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';

export interface IUserRepository {
  findByEmail(email: string): Promise<PrismaUser | null>;
  findByUsername(username: string): Promise<PrismaUser | null>;
  findById(id: number): Promise<PrismaUser | null>;
  create(
    createUserDto: CreateUserDto & { hashedPassword: string },
  ): Promise<PrismaUser>;
}
