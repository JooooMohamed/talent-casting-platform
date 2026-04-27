import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, MaxLength } from 'class-validator';

export class MediaAssetDto {
  @ApiProperty()
  @IsUrl({ require_protocol: true })
  url: string;

  @ApiProperty()
  @IsString()
  publicId: string;
}

export class PortfolioMediaAssetDto extends MediaAssetDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  title: string;
}
