import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role?: string;
  }): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: input.email });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    return this.userModel.create(input);
  }

  async findByEmail(
    email: string,
    withCredentials = false
  ): Promise<UserDocument | null> {
    if (withCredentials) {
      return (this.userModel
        .findOne({ email })
        .select('+passwordHash +refreshTokenHash')
        .exec() as Promise<UserDocument | null>);
    }

    return this.userModel.findOne({ email }).exec() as Promise<UserDocument | null>;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async setRefreshToken(
    id: string,
    refreshToken: string
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(id, { refreshTokenHash });
  }

  async clearRefreshToken(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshTokenHash: undefined });
  }

  async verifyRefreshToken(
    id: string,
    refreshToken: string
  ): Promise<boolean> {
    const user = await this.userModel
      .findById(id)
      .select('+passwordHash +refreshTokenHash');

    if (!user || !user.refreshTokenHash) {
      return false;
    }

    return bcrypt.compare(refreshToken, user.refreshTokenHash);
  }

  sanitize(user: UserDocument) {
    const { _id, name, email, role, createdAt, updatedAt } = user;

    return {
      id: _id.toString(),
      name,
      email,
      role,
      createdAt,
      updatedAt
    };
  }
}
