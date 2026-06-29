import { Type } from "class-transformer";
import {IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min} from 'class-validator';
import { IncidentSeverity } from '../incident-severity.enum';
import { IncidentStatus } from '../incident-status.enum';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class FindIncidentsQueryDto {
  @ApiPropertyOptional({
    enum: IncidentStatus,
    example: IncidentStatus.Open
  })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @ApiPropertyOptional({
    enum: IncidentSeverity,
    example: IncidentSeverity.Critical
  })
  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @ApiPropertyOptional({
    example: 'login',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;


  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;


  @ApiPropertyOptional({
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}