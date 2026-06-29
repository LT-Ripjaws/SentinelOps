import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EvidenceType } from '../evidence-type.enum';
import { ApiProperty,  ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEvidenceDto {
  @ApiProperty({
    enum: EvidenceType,
    example: EvidenceType.Screenshot
  })
  @IsEnum(EvidenceType)
  type: EvidenceType;

  @ApiPropertyOptional({
    example: 'Screenshot of suspicious login alert',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}