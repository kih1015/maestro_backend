import { User } from '../user.domain';

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    create(user: User): Promise<User>;
}
