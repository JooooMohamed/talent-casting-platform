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
  ApprovalStatus,
  ContactRequestStatus,
  NotificationType,
} from '@talent-casting/shared';
import { TalentProfile, TalentProfileDocument } from '../talent/schemas/talent-profile.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { ContactRequest, ContactRequestDocument } from './schemas/contact-request.schema';
import { CreateContactRequestDto } from './dto/contact-request.dto';

@Injectable()
export class ContactRequestsService {
  constructor(
    @InjectModel(ContactRequest.name) private contactRequestModel: Model<ContactRequestDocument>,
    @InjectModel(TalentProfile.name) private talentModel: Model<TalentProfileDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    requesterUserId: string,
    requesterEmail: string,
    talentProfileId: string,
    dto: CreateContactRequestDto,
  ): Promise<ContactRequestDocument> {
    if (!Types.ObjectId.isValid(talentProfileId)) {
      throw new BadRequestException('Invalid talent profile id');
    }

    const profile = await this.talentModel.findOne({
      _id: talentProfileId,
      approvalStatus: ApprovalStatus.APPROVED,
      isPublic: true,
    });
    if (!profile) throw new NotFoundException('Talent profile not found');

    const pending = await this.contactRequestModel.findOne({
      requesterUserId: new Types.ObjectId(requesterUserId),
      talentProfileId: profile._id,
      status: ContactRequestStatus.PENDING,
    });
    if (pending) throw new ConflictException('You already have a pending contact request for this talent');

    const contactRequest = await this.contactRequestModel.create({
      requesterUserId: new Types.ObjectId(requesterUserId),
      talentProfileId: profile._id,
      talentUserId: profile.userId,
      projectTitle: dto.projectTitle,
      message: dto.message,
      contactEmail: dto.contactEmail || requesterEmail,
    });

    await this.notificationsService.create(
      profile.userId.toString(),
      NotificationType.CONTACT_REQUEST,
      'New contact request',
      'A casting professional wants to contact you.',
      { contactRequestId: contactRequest._id, talentProfileId: profile._id },
    );

    return contactRequest;
  }

  async findSent(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const filter = { requesterUserId: new Types.ObjectId(userId) };
    const [items, total] = await Promise.all([
      this.contactRequestModel
        .find(filter)
        .populate({ path: 'talentProfileId', select: 'fullName slug profilePhoto city country categories' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.contactRequestModel.countDocuments(filter),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findReceived(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const filter = { talentUserId: new Types.ObjectId(userId) };
    const [items, total] = await Promise.all([
      this.contactRequestModel
        .find(filter)
        .populate({ path: 'requesterUserId', select: 'email' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.contactRequestModel.countDocuments(filter),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(
    userId: string,
    requestId: string,
    status: ContactRequestStatus.ACCEPTED | ContactRequestStatus.REJECTED,
    responseMessage?: string,
  ): Promise<ContactRequestDocument> {
    if (!Types.ObjectId.isValid(requestId)) throw new BadRequestException('Invalid contact request id');

    const contactRequest = await this.contactRequestModel.findById(requestId);
    if (!contactRequest) throw new NotFoundException('Contact request not found');
    if (contactRequest.talentUserId.toString() !== userId) throw new ForbiddenException();

    contactRequest.status = status;
    contactRequest.responseMessage = responseMessage;
    await contactRequest.save();

    await this.notificationsService.create(
      contactRequest.requesterUserId.toString(),
      NotificationType.CONTACT_REQUEST_STATUS,
      'Contact request updated',
      `Your contact request was ${status}.`,
      { contactRequestId: contactRequest._id, status },
    );

    return contactRequest;
  }
}
