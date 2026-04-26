import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
  ) {}

  async apply(talentUserId: string, castingCallId: string, coverMessage?: string): Promise<ApplicationDocument> {
    const existing = await this.applicationModel.findOne({
      castingCallId: new Types.ObjectId(castingCallId),
      talentUserId: new Types.ObjectId(talentUserId),
    });
    if (existing) throw new ConflictException('You have already applied to this casting call');

    return this.applicationModel.create({
      castingCallId: new Types.ObjectId(castingCallId),
      talentUserId: new Types.ObjectId(talentUserId),
      coverMessage,
    });
  }

  async getByCall(castingCallId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.applicationModel
        .find({ castingCallId: new Types.ObjectId(castingCallId) })
        .populate({ path: 'talentUserId', select: 'email' })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.applicationModel.countDocuments({ castingCallId: new Types.ObjectId(castingCallId) }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMyApplications(talentUserId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.applicationModel
        .find({ talentUserId: new Types.ObjectId(talentUserId) })
        .populate('castingCallId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.applicationModel.countDocuments({ talentUserId: new Types.ObjectId(talentUserId) }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(appId: string, status: string, notes?: string): Promise<ApplicationDocument> {
    const app = await this.applicationModel.findByIdAndUpdate(
      appId,
      { status, ...(notes && { notes }) },
      { new: true },
    );
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }
}
