import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString, MaxLength } from 'class-validator';
import { UserStatus } from '@talent-casting/shared';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class RejectProfileDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  reason: string;
}

export class ToggleFeaturedDto {
  @ApiProperty()
  @IsBoolean()
  isFeatured: boolean;
}

export class ToggleVerifiedDto {
  @ApiProperty()
  @IsBoolean()
  isVerified: boolean;
}
