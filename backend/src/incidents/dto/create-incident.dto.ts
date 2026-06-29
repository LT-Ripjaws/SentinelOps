import { IsNotEmpty, IsString, IsMongoId, IsOptional, MinLength, IsEnum } from 'class-validator';
import { IncidentSeverity } from '../incident-severity.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIncidentDto {
    @ApiProperty({
        example: 'Suspicious login activity detected',
        minLength: 3
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty({
        example: 'Multiple failed login attempts were detected from an unusual location',
        minLength: 10
    })
    @IsString()
    @MinLength(10)
    description: string;

    @ApiPropertyOptional({
        enum: IncidentSeverity,
        example: IncidentSeverity.High
    })
    @IsOptional()
    @IsEnum(IncidentSeverity)
    severity?: IncidentSeverity;

    @ApiProperty({
        example: '665f1c2b4b3f2a0012abcd34',
        description: 'MongoDB ObjectId of the assigned analyst',
    })
    @IsMongoId()
    assignedTo: string;
}

