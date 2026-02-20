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

  async findAllDocs() {
    return this.prisma.employeeDocument.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true
          }
        }
      },
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
    const allowedMime = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMime.includes(dto.mimeType)) {
      throw new Error('Unsupported file type');
    }
    const maxSize = 10 * 1024 * 1024;
    if (dto.fileSize > maxSize) {
      throw new Error('File too large');
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

  async reviewDocument(
    documentId: string,
    reviewerId: string,
    status: DocumentStatus,
    comments?: string,
  ) {
    const doc = await this.prisma.employeeDocument.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    const updated = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        comments,
      },
    });
    await this.evaluateOnboardingCompletion(updated.employeeId);
    return updated;
  }

  private async evaluateOnboardingCompletion(employeeId: string) {
    const required: DocumentType[] = [
      'GOVERNMENT_ID',
      'TAX_ID',
      'RESUME',
      'PROFILE_PHOTO',
      'BANK_PROOF',
      'EDUCATION',
      'EXPERIENCE',
      'OFFER_LETTER',
    ] as unknown as DocumentType[];
    const docs = await this.prisma.employeeDocument.findMany({
      where: { employeeId, documentType: { in: required } },
    });
    const typesApproved = new Set(
      docs
        .filter((d) => d.status === DocumentStatus.APPROVED)
        .map((d) => d.documentType),
    );
    const allApproved = required.every((t) => typesApproved.has(t));
    if (allApproved) {
      await this.prisma.employee.update({
        where: { id: employeeId },
        data: { status: 'ACTIVE' },
      });
    }
  }
}
