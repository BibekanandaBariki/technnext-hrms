import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsEnum([
    'PROFILE_PHOTO',
    'GOVERNMENT_ID',
    'TAX_ID',
    'RESUME',
    'BANK_PROOF',
    'EDUCATION',
    'EXPERIENCE',
    'OFFER_LETTER',
    'OTHER',
  ])
  documentType: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsUrl()
  fileUrl: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  fileSize: number;

  @IsNotEmpty()
  @IsString()
  mimeType: string;
}
