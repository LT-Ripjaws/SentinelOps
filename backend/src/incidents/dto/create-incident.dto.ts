import { IsNotEmpty, IsString, IsMongoId, IsOptional, MinLength, IsEnum } from 'class-validator';
import { IncidentSeverity } from '../incident-severity.enum';

export class CreateIncidentDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    title: string;

    @IsString()
    @MinLength(10)
    description: string;

    @IsOptional()
    @IsEnum(IncidentSeverity)
    severity?: IncidentSeverity;

    @IsMongoId()
    assignedTo: string;
}

