import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class UpdateDocumentStatusDto {
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}
