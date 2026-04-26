import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  AvailabilityStatus,
  TalentCategory,
  ExperienceLevel,
  ApprovalStatus,
  ContactVisibility,
  VideoStatus,
  MediaAsset,
  SocialLinks,
  Language,
  PreviousWork,
} from '@talent-casting/shared';

export type TalentProfileDocument = TalentProfile & Document;

@Schema({ timestamps: true })
export class TalentProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ unique: true, sparse: true, lowercase: true })
  slug: string;

  @Prop({ type: Object, default: null })
  profilePhoto: MediaAsset;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: String, enum: ['male', 'female', 'non_binary', 'prefer_not_to_say'] })
  gender: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  country: string;

  @Prop({ trim: true })
  nationality: string;

  // Physical
  @Prop({ type: Number })
  height: number;

  @Prop({ type: Number })
  weight: number;

  @Prop({ trim: true })
  eyeColor: string;

  @Prop({ trim: true })
  hairColor: string;

  @Prop({ trim: true })
  bodyType: string;

  @Prop({ trim: true })
  ethnicity: string;

  // Professional
  @Prop({ maxlength: 1000 })
  bio: string;

  @Prop({ type: String, enum: ExperienceLevel })
  experience: ExperienceLevel;

  @Prop({ type: [Object], default: [] })
  languages: Language[];

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], enum: TalentCategory, default: [] })
  categories: TalentCategory[];

  // Media
  @Prop({ type: Object, default: null })
  introVideo: MediaAsset & { status: VideoStatus; rejectionReason?: string };

  @Prop({ type: Object, default: null })
  sceneVideo: MediaAsset & { status: VideoStatus; rejectionReason?: string };

  @Prop({ type: [Object], default: [] })
  portfolioVideos: (MediaAsset & { title: string; status: VideoStatus })[];

  // Links
  @Prop({ type: [Object], default: [] })
  previousWorkLinks: PreviousWork[];

  @Prop({ type: Object, default: {} })
  socialLinks: SocialLinks;

  // Status
  @Prop({ type: String, enum: AvailabilityStatus, default: AvailabilityStatus.AVAILABLE })
  availability: AvailabilityStatus;

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: String, enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  approvalStatus: ApprovalStatus;

  @Prop({ type: String, default: null })
  rejectionReason: string;

  @Prop({ type: String, enum: ContactVisibility, default: ContactVisibility.ON_REQUEST })
  contactVisibility: ContactVisibility;

  // Stats
  @Prop({ default: 0 })
  profileViews: number;

  @Prop({ default: 0 })
  videoPlays: number;
}

export const TalentProfileSchema = SchemaFactory.createForClass(TalentProfile);

TalentProfileSchema.index({ approvalStatus: 1, isPublic: 1 });
TalentProfileSchema.index({ categories: 1 });
TalentProfileSchema.index({ country: 1, city: 1 });
TalentProfileSchema.index({ experience: 1 });
TalentProfileSchema.index({ isFeatured: -1, createdAt: -1 });
TalentProfileSchema.index({ fullName: 'text', bio: 'text', skills: 'text' });
