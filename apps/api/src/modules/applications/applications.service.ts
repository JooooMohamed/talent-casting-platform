import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ApplicationStatus,
  ApprovalStatus,
  CastingCallStatus,
  NotificationType,
} from '@talent-casting/shared';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { CastingCall, CastingCallDocument } from '../casting-calls/schemas/casting-call.schema';
import { TalentProfile, TalentProfileDocument } from '../talent/schemas/talent-profile.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(CastingCall.name) private castingCallModel: Model<CastingCallDocument>,
    @InjectModel(TalentProfile.name) private talentModel: Model<TalentProfileDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async apply(talentUserId: string, castingCallId: string, coverMessage?: string): Promise<ApplicationDocument> {
    if (!Types.ObjectId.isValid(castingCallId)) throw new BadRequestException('Invalid casting call id');

    const call = await this.castingCallModel.findOne({
      _id: castingCallId,
      status: CastingCallStatus.OPEN,
      isPublic: true,
    });
    if (!call) throw new NotFoundException('Casting call not found or no longer open');
    if (call.deadline && call.deadline.getTime() < Date.now()) {
      throw new BadRequestException('This casting call deadline has passed');
    }

    const talentProfile = await this.talentModel.findOne({
      userId: new Types.ObjectId(talentUserId),
      approvalStatus: ApprovalStatus.APPROVED,
      isPublic: true,
    });
    if (!talentProfile) throw new BadRequestException('Create and approve your public talent profile before applying');

    const existing = await this.applicationModel.findOne({
      castingCallId: new Types.ObjectId(castingCallId),
      talentUserId: new Types.ObjectId(talentUserId),
    });
    if (existing) throw new ConflictException('You have already applied to this casting call');

    const application = await this.applicationModel.create({
      castingCallId: new Types.ObjectId(castingCallId),
      talentUserId: new Types.ObjectId(talentUserId),
      talentProfileId: talentProfile._id,
      coverMessage,
    });

    await this.notificationsService.create(
      call.castingUserId.toString(),
      NotificationType.NEW_APPLICATION,
      'New application',
      `${talentProfile.fullName} applied to ${call.title}.`,
      { applicationId: application._id, castingCallId: call._id, talentProfileId: talentProfile._id },
    );

    return application;
  }

  async getByCall(castingUserId: string, castingCallId: string, page: number, limit: number) {
    const call = await this.assertCallOwner(castingUserId, castingCallId);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.applicationModel
        .find({ castingCallId: call._id })
        .populate({ path: 'talentUserId', select: 'email' })
        .populate({ path: 'talentProfileId', select: 'fullName slug profilePhoto city country categories experience isVerified' })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.applicationModel.countDocuments({ castingCallId: call._id }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMyApplications(talentUserId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.applicationModel
        .find({ talentUserId: new Types.ObjectId(talentUserId) })
        .populate('castingCallId')
        .populate({ path: 'talentProfileId', select: 'fullName slug profilePhoto' })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.applicationModel.countDocuments({ talentUserId: new Types.ObjectId(talentUserId) }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(
    castingUserId: string,
    castingCallId: string,
    appId: string,
    status: ApplicationStatus,
    notes?: string,
  ): Promise<ApplicationDocument> {
    const call = await this.assertCallOwner(castingUserId, castingCallId);
    if (!Types.ObjectId.isValid(appId)) throw new BadRequestException('Invalid application id');

    const app = await this.applicationModel.findOneAndUpdate(
      { _id: appId, castingCallId: call._id },
      { status, ...(notes && { notes }) },
      { new: true },
    );
    if (!app) throw new NotFoundException('Application not found');

    await this.notificationsService.create(
      app.talentUserId.toString(),
      NotificationType.APPLICATION_STATUS,
      'Application updated',
      `Your application for ${call.title} was marked ${status}.`,
      { applicationId: app._id, castingCallId: call._id, status },
    );

    return app;
  }

  private async assertCallOwner(castingUserId: string, castingCallId: string): Promise<CastingCallDocument> {
    if (!Types.ObjectId.isValid(castingCallId)) throw new BadRequestException('Invalid casting call id');
    const call = await this.castingCallModel.findById(castingCallId);
    if (!call) throw new NotFoundException('Casting call not found');
    if (call.castingUserId.toString() !== castingUserId) throw new ForbiddenException();
    return call;
  }
}
