import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'analyst@example.com',
        description: 'User email address'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @ApiProperty({
        example: 'analyst1234',
        description: 'User password',
        minLength: 8
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string;
}
