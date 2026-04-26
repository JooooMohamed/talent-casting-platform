import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CastingCallStatus, TalentCategory, ExperienceLevel } from '@talent-casting/shared';

export type CastingCallDocument = CastingCall & Document;

@Schema({ timestamps: true })
export class CastingCall {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  castingUserId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, maxlength: 3000 })
  description: string;

  @Prop({ trim: true })
  roleType: string;

  @Prop({ type: [String], enum: TalentCategory, default: [] })
  categories: TalentCategory[];

  @Prop({ type: [String], default: [] })
  skillsRequired: string[];

  @Prop({
    type: {
      ageMin: Number,
      ageMax: Number,
      gender: String,
      languages: [String],
      city: String,
      country: String,
      experience: { type: String, enum: ExperienceLevel },
    },
    default: {},
  })
  requirements: {
    ageMin?: number;
    ageMax?: number;
    gender?: string;
    languages?: string[];
    city?: string;
    country?: string;
    experience?: ExperienceLevel;
  };

  @Prop({ type: Object, default: { compensationType: 'tbd' } })
  compensation: { compensationType: string; details?: string };

  @Prop({ type: Date })
  deadline: Date;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: String, enum: CastingCallStatus, default: CastingCallStatus.OPEN })
  status: CastingCallStatus;

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'TalentProfile' }], default: [] })
  invitedTalents: Types.ObjectId[];
}

export const CastingCallSchema = SchemaFactory.createForClass(CastingCall);
CastingCallSchema.index({ status: 1, isPublic: 1, createdAt: -1 });
CastingCallSchema.index({ castingUserId: 1 });
CastingCallSchema.index({ title: 'text', description: 'text' });
