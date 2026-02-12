import { IsNotEmpty, IsEnum, IsNumber, Min, IsString } from 'class-validator';
// import { TaxRegime } from '@prisma/client';

export class DeclareTaxDto {
  @IsNotEmpty()
  @IsString()
  financialYear: string;

  @IsNotEmpty()
  @IsNotEmpty()
  @IsEnum(['OLD_REGIME', 'NEW_REGIME'])
  regime: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  section80C: number;

  // Add other fields as simplified for MVP
}
