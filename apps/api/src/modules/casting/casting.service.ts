import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CastingProfile, CastingProfileDocument } from './schemas/casting-profile.schema';

@Injectable()
export class CastingService {
  constructor(
    @InjectModel(CastingProfile.name) private castingModel: Model<CastingProfileDocument>,
  ) {}

  async createOrUpdateProfile(userId: string, dto: Partial<CastingProfile>): Promise<CastingProfileDocument> {
    const existing = await this.castingModel.findOne({ userId });
    if (existing) {
      Object.assign(existing, dto);
      return existing.save();
    }
    return this.castingModel.create({ ...dto, userId });
  }

  async getMyProfile(userId: string): Promise<CastingProfileDocument> {
    const profile = await this.castingModel.findOne({ userId }).populate('savedTalents');
    if (!profile) throw new NotFoundException('Company profile not found');
    return profile;
  }

  async saveTalent(userId: string, talentProfileId: string): Promise<void> {
    await this.castingModel.findOneAndUpdate(
      { userId },
      { $addToSet: { savedTalents: new Types.ObjectId(talentProfileId) } },
    );
  }

  async unsaveTalent(userId: string, talentProfileId: string): Promise<void> {
    await this.castingModel.findOneAndUpdate(
      { userId },
      { $pull: { savedTalents: new Types.ObjectId(talentProfileId) } },
    );
  }

  async getSavedTalents(userId: string) {
    const profile = await this.castingModel
      .findOne({ userId })
      .populate({ path: 'savedTalents', select: 'fullName slug profilePhoto categories city country experience isVerified' });
    return profile?.savedTalents || [];
  }

  async findByUserId(userId: string): Promise<CastingProfileDocument | null> {
    return this.castingModel.findOne({ userId });
  }
}
