import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole, UserStatus } from '@talent-casting/shared';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(email: string, password: string, role: UserRole): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    return this.userModel.create({ email, passwordHash, role });
  }

  async findByEmail(email: string, includePassword = false): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email });
    if (includePassword) query.select('+passwordHash');
    return query.exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateRefreshToken(userId: string, token: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: token });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  async findAll(page: number, limit: number, role?: UserRole) {
    const filter = role ? { role } : {};
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(userId: string, status: UserStatus): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
