import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ContactRequestStatus } from '@talent-casting/shared';

export type ContactRequestDocument = ContactRequest & Document;

@Schema({ timestamps: true })
export class ContactRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TalentProfile', required: true })
  talentProfileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  talentUserId: Types.ObjectId;

  @Prop({ trim: true, maxlength: 200 })
  projectTitle: string;

  @Prop({ trim: true, maxlength: 1000 })
  message: string;

  @Prop({ trim: true, lowercase: true })
  contactEmail: string;

  @Prop({ type: String, enum: ContactRequestStatus, default: ContactRequestStatus.PENDING })
  status: ContactRequestStatus;

  @Prop({ trim: true, maxlength: 1000 })
  responseMessage: string;
}

export const ContactRequestSchema = SchemaFactory.createForClass(ContactRequest);
ContactRequestSchema.index({ requesterUserId: 1, createdAt: -1 });
ContactRequestSchema.index({ talentUserId: 1, status: 1, createdAt: -1 });
ContactRequestSchema.index({ requesterUserId: 1, talentProfileId: 1, status: 1 });
