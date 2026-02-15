import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { CreateDocumentDto } from './dto/create-document.dto';
import { PresignDto } from './dto/presign.dto';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class DocumentsService {
  private s3: S3Client | null = null;
  private bucket: string | null = null;
  private region: string | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const region = this.config.get<string>('AWS_REGION');
    const bucket = this.config.get<string>('S3_BUCKET_NAME');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    if (region && bucket && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.bucket = bucket;
      this.region = region;
    }
  }

  async listForUser(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }
    return this.prisma.employeeDocument.findMany({
      where: { employeeId: employee.id },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async createForUser(userId: string, dto: CreateDocumentDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }
    return this.prisma.employeeDocument.create({
      data: {
        employeeId: employee.id,
        documentType: dto.documentType as unknown as DocumentType,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        status: DocumentStatus.PENDING,
      },
    });
  }

  async presignForUser(userId: string, dto: PresignDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }
    if (!this.s3 || !this.bucket || !this.region) {
      throw new Error('S3 not configured');
    }
    const timestamp = Date.now();
    const key = `employees/${employee.id}/${timestamp}-${dto.fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.mimeType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 });
    const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return { uploadUrl, fileUrl, key };
  }
}
