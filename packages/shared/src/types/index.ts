// ─── Enums ────────────────────────────────────────────────────────────────────

export enum UserRole {
  TALENT = 'talent',
  CASTING = 'casting',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  NOT_LOOKING = 'not_looking',
}

export enum TalentCategory {
  DRAMA = 'drama',
  COMEDY = 'comedy',
  ACTION = 'action',
  THEATRE = 'theatre',
  VOICE_OVER = 'voice_over',
  MODELING = 'modeling',
  DANCE = 'dance',
  SINGING = 'singing',
  PRESENTING = 'presenting',
  INFLUENCER = 'influencer',
  COMMERCIAL = 'commercial',
  OTHER = 'other',
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  PROFESSIONAL = 'professional',
  VETERAN = 'veteran',
}

export enum VideoType {
  INTRO = 'intro',
  SCENE = 'scene',
  PORTFOLIO = 'portfolio',
}

export enum VideoStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  OFFERED = 'offered',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum CastingCallStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
  FILLED = 'filled',
}

export enum ContactVisibility {
  EVERYONE = 'everyone',
  SUBSCRIBERS_ONLY = 'subscribers_only',
  ON_REQUEST = 'on_request',
}

export enum NotificationType {
  PROFILE_APPROVED = 'profile_approved',
  PROFILE_REJECTED = 'profile_rejected',
  VIDEO_APPROVED = 'video_approved',
  VIDEO_REJECTED = 'video_rejected',
  BOOKING_REQUEST = 'booking_request',
  BOOKING_ACCEPTED = 'booking_accepted',
  BOOKING_REJECTED = 'booking_rejected',
  CASTING_INVITATION = 'casting_invitation',
  APPLICATION_STATUS = 'application_status',
  NEW_APPLICATION = 'new_application',
  CONTACT_REQUEST = 'contact_request',
  CONTACT_REQUEST_STATUS = 'contact_request_status',
}

export enum ContactRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface MediaAsset {
  url: string;
  publicId: string;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  imdb?: string;
  website?: string;
}

export interface PreviousWork {
  label: string;
  url: string;
}

export interface Language {
  language: string;
  level: 'native' | 'fluent' | 'conversational' | 'basic';
}

export interface Compensation {
  type: 'paid' | 'unpaid' | 'tbd';
  details?: string;
}

export interface CastingRequirements {
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  languages?: string[];
  city?: string;
  country?: string;
  experience?: ExperienceLevel;
}

export interface TalentFilters extends PaginationQuery {
  category?: TalentCategory;
  gender?: string;
  city?: string;
  country?: string;
  experience?: ExperienceLevel;
  language?: string;
  ageMin?: number;
  ageMax?: number;
  availability?: AvailabilityStatus;
  search?: string;
}
