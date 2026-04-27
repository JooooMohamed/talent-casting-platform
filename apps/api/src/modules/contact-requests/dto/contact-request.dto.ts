import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContactRequestStatus } from '@talent-casting/shared';

export class CreateContactRequestDto {
  @ApiPropertyOptional({ example: 'Lead role in short film' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectTitle?: string;

  @ApiProperty({ example: 'We would like to discuss your availability for a role.' })
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiPropertyOptional({ example: 'casting@example.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

export class UpdateContactRequestStatusDto {
  @ApiProperty({ enum: [ContactRequestStatus.ACCEPTED, ContactRequestStatus.REJECTED] })
  @IsEnum([ContactRequestStatus.ACCEPTED, ContactRequestStatus.REJECTED])
  status: ContactRequestStatus.ACCEPTED | ContactRequestStatus.REJECTED;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  responseMessage?: string;
}
