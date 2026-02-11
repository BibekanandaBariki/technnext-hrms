import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
// import { Gender, EmploymentType } from '@prisma/client';

export class CreateEmployeeDto {
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsDateString()
    joiningDate: string;

    @IsOptional()
    @IsString()
    departmentId?: string;

    @IsOptional()
    @IsString()
    designationId?: string;

    @IsOptional()
    @IsEnum(['PERMANENT', 'CONTRACT', 'INTERN']) // Hardcoded to avoid import error
    employmentType?: 'PERMANENT' | 'CONTRACT' | 'INTERN';

    @IsOptional()
    @IsString()
    reportingManagerId?: string;

    // Add other fields as necessary based on schema
}
