import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApprovalStatus, MediaAsset } from '@talent-casting/shared';

export type CastingProfileDocument = CastingProfile & Document;

@Schema({ timestamps: true })
export class CastingProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  companyName: string;

  @Prop({ type: Object, default: null })
  logo: MediaAsset;

  @Prop({ trim: true })
  industry: string;

  @Prop({ trim: true })
  website: string;

  @Prop({ maxlength: 1000 })
  bio: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  country: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: String, enum: ApprovalStatus, default: ApprovalStatus.APPROVED })
  approvalStatus: ApprovalStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'TalentProfile' }], default: [] })
  savedTalents: Types.ObjectId[];
}

export const CastingProfileSchema = SchemaFactory.createForClass(CastingProfile);
