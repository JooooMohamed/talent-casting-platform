import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CastingCallStatus, ExperienceLevel, TalentCategory } from '@talent-casting/shared';

class CastingRequirementsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  @Type(() => Number)
  ageMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  @Type(() => Number)
  ageMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experience?: ExperienceLevel;
}

class CompensationDto {
  @ApiPropertyOptional({ enum: ['paid', 'unpaid', 'tbd'] })
  @IsOptional()
  @IsEnum(['paid', 'unpaid', 'tbd'])
  type?: 'paid' | 'unpaid' | 'tbd';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;
}

export class CreateCastingCallDto {
  @ApiProperty({ example: 'Lead Actor for Drama Series' })
  @IsString()
  @MaxLength(180)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(3000)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  roleType?: string;

  @ApiPropertyOptional({ enum: TalentCategory, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TalentCategory, { each: true })
  categories?: TalentCategory[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsRequired?: string[];

  @ApiPropertyOptional({ type: CastingRequirementsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CastingRequirementsDto)
  requirements?: CastingRequirementsDto;

  @ApiPropertyOptional({ type: CompensationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompensationDto)
  compensation?: CompensationDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateCastingCallDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  roleType?: string;

  @ApiPropertyOptional({ enum: TalentCategory, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TalentCategory, { each: true })
  categories?: TalentCategory[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsRequired?: string[];

  @ApiPropertyOptional({ type: CastingRequirementsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CastingRequirementsDto)
  requirements?: CastingRequirementsDto;

  @ApiPropertyOptional({ type: CompensationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompensationDto)
  compensation?: CompensationDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ enum: CastingCallStatus })
  @IsOptional()
  @IsEnum(CastingCallStatus)
  status?: CastingCallStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
