import {
  IsString, IsOptional, IsEnum, IsArray, IsNumber, IsDateString,
  IsBoolean, IsUrl, MaxLength, Min, Max, ValidateNested, IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TalentCategory, ExperienceLevel, AvailabilityStatus, ContactVisibility } from '@talent-casting/shared';
import { Type } from 'class-transformer';

class LanguageDto {
  @IsString()
  language: string;

  @IsEnum(['native', 'fluent', 'conversational', 'basic'])
  level: 'native' | 'fluent' | 'conversational' | 'basic';
}

class PreviousWorkDto {
  @IsString()
  @MaxLength(120)
  label: string;

  @IsUrl({ require_protocol: true })
  url: string;
}

class SocialLinksDto {
  @IsOptional()
  @IsUrl({ require_protocol: true })
  instagram?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  tiktok?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  youtube?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  imdb?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;
}

export class CreateTalentProfileDto {
  @ApiPropertyOptional()
  @IsString()
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['male', 'female', 'non_binary', 'prefer_not_to_say'])
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  @Type(() => Number)
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eyeColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hairColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ethnicity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experience?: ExperienceLevel;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languages?: LanguageDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ enum: TalentCategory, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TalentCategory, { each: true })
  categories?: TalentCategory[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviousWorkDto)
  previousWorkLinks?: PreviousWorkDto[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({ enum: AvailabilityStatus })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ enum: ContactVisibility })
  @IsOptional()
  @IsEnum(ContactVisibility)
  contactVisibility?: ContactVisibility;
}
