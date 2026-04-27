import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CastingCall, CastingCallDocument } from './schemas/casting-call.schema';
import { CastingCallStatus } from '@talent-casting/shared';
import { CreateCastingCallDto, UpdateCastingCallDto } from './dto/casting-call.dto';

@Injectable()
export class CastingCallsService {
  constructor(
    @InjectModel(CastingCall.name) private castingCallModel: Model<CastingCallDocument>,
  ) {}

  async create(userId: string, dto: CreateCastingCallDto): Promise<CastingCallDocument> {
    return this.castingCallModel.create({ ...dto, castingUserId: userId });
  }

  async findAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = { status: CastingCallStatus.OPEN, isPublic: true };
    if (search) query.$text = { $search: search };

    const [items, total] = await Promise.all([
      this.castingCallModel
        .find(query)
        .populate('castingUserId', 'email')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.castingCallModel.countDocuments(query),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<CastingCallDocument> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid casting call id');
    const call = await this.castingCallModel.findById(id).populate('castingUserId', 'email');
    if (!call) throw new NotFoundException('Casting call not found');
    return call;
  }

  async findMyCalls(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.castingCallModel.find({ castingUserId: userId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.castingCallModel.countDocuments({ castingUserId: userId }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(userId: string, callId: string, dto: UpdateCastingCallDto): Promise<CastingCallDocument> {
    if (!Types.ObjectId.isValid(callId)) throw new BadRequestException('Invalid casting call id');
    const call = await this.castingCallModel.findById(callId);
    if (!call) throw new NotFoundException('Casting call not found');
    if (call.castingUserId.toString() !== userId) throw new ForbiddenException();
    Object.assign(call, dto);
    return call.save();
  }

  async delete(userId: string, callId: string): Promise<void> {
    if (!Types.ObjectId.isValid(callId)) throw new BadRequestException('Invalid casting call id');
    const call = await this.castingCallModel.findById(callId);
    if (!call) throw new NotFoundException('Casting call not found');
    if (call.castingUserId.toString() !== userId) throw new ForbiddenException();
    await call.deleteOne();
  }

  async inviteTalent(userId: string, callId: string, talentProfileId: string): Promise<void> {
    if (!Types.ObjectId.isValid(callId) || !Types.ObjectId.isValid(talentProfileId)) {
      throw new BadRequestException('Invalid id');
    }
    const call = await this.castingCallModel.findById(callId);
    if (!call) throw new NotFoundException('Casting call not found');
    if (call.castingUserId.toString() !== userId) throw new ForbiddenException();
    await this.castingCallModel.findByIdAndUpdate(callId, {
      $addToSet: { invitedTalents: new Types.ObjectId(talentProfileId) },
    });
  }

  async closeCastingCall(callId: string, status: CastingCallStatus): Promise<void> {
    await this.castingCallModel.findByIdAndUpdate(callId, { status });
  }
}
