import { Type } from "class-transformer";
import {IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min} from 'class-validator';
import { IncidentSeverity } from '../incident-severity.enum';
import { IncidentStatus } from '../incident-status.enum';

export class FindIncidentsQueryDto {
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}