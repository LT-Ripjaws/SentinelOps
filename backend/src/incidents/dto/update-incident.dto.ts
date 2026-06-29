import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateIncidentDto } from './create-incident.dto';
import { IncidentStatus } from '../incident-status.enum';


export class UpdateIncidentDto extends PartialType(CreateIncidentDto) {
  @ApiPropertyOptional({
    enum: IncidentStatus,
    example: IncidentStatus.Investigating,
    description: 'New lifecycle status for the incident'
  })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}