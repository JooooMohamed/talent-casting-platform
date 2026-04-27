import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateCastingProfileDto {
  @ApiProperty({ example: 'Studio One Productions' })
  @IsString()
  @MaxLength(160)
  companyName: string;

  @ApiPropertyOptional({ example: 'Film & Television' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  industry?: string;

  @ApiPropertyOptional({ example: 'https://studioone.example' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;
}
