import bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

/**
 * 사용자 생성/조회에 사용되는 속성 묶음.
 */
export interface UserProps {
  readonly id: number;
  readonly email: string;
  readonly username: string;
  readonly universityCode: string;
  readonly hashedPassword: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * 사용자 엔터티. 비밀번호는 해시 형태로만 보관한다.
 */
export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly username: string,
    public readonly universityCode: string,
    public readonly hashedPassword: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * 신규 사용자를 생성한다. 평문 비밀번호를 안전하게 해싱한다.
   */
  static async create(
    props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    return new User(
      -1,
      props.email,
      props.username,
      props.universityCode,
      await this.hashPassword(props.hashedPassword),
      new Date(),
      new Date(),
    );
  }

  /**
   * 영속 계층에서 읽은 데이터를 기반으로 엔터티를 복원한다.
   */
  static of(props: UserProps) {
    return new User(
      props.id,
      props.email,
      props.username,
      props.universityCode,
      props.hashedPassword,
      props.createdAt,
      props.updatedAt,
    );
  }

  /** 비밀번호를 해시한다. */
  private static async hashPassword(plainPassword: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(plainPassword, saltRounds);
  }

  /**
   * 평문 비밀번호가 일치하는지 검증한다.
   * @throws DomainException 일치하지 않을 때
   */
  async verifyPassword(plainPassword: string): Promise<void> {
    const isPasswordValid = await bcrypt.compare(
      plainPassword,
      this.hashedPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }
}
