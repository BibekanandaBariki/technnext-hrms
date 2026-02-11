import { IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateSalaryStructureDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    ctc: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    basicSalary: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    hra: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    specialAllowance: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    pfEmployer: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    pfEmployee: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    professionalTax: number;

    @IsNotEmpty()
    @IsDateString()
    effectiveFrom: string;
}
