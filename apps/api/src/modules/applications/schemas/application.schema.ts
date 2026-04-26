import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApplicationStatus } from '@talent-casting/shared';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'CastingCall', required: true })
  castingCallId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  talentUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TalentProfile' })
  talentProfileId: Types.ObjectId;

  @Prop({ maxlength: 1000 })
  coverMessage: string;

  @Prop({ type: String, enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @Prop({ maxlength: 1000 })
  notes: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
ApplicationSchema.index({ castingCallId: 1, status: 1 });
ApplicationSchema.index({ talentUserId: 1 });
ApplicationSchema.index({ castingCallId: 1, talentUserId: 1 }, { unique: true });
