import { IsEmail, IsNotEmpty, MinLength, IsString, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsOptional()
    @IsEnum(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'])
    role?: string;
}
