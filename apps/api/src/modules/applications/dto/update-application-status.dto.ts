import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApplicationStatus } from '@talent-casting/shared';

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
