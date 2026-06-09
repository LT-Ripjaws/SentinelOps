import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EvidenceType } from '../evidence-type.enum';

export class CreateEvidenceDto {
  @IsEnum(EvidenceType)
  type: EvidenceType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}