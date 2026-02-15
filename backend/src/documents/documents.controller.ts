import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateDocumentDto } from './dto/create-document.dto';
import { PresignDto } from './dto/presign.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { Role } from '@prisma/client';

interface RequestUser {
  id: string;
}

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  list(@GetUser() user: RequestUser) {
    return this.documentsService.listForUser(user.id);
  }

  @Post()
  create(@GetUser() user: RequestUser, @Body() dto: CreateDocumentDto) {
    return this.documentsService.createForUser(user.id, dto);
  }

  @Post('presign')
  presign(@GetUser() user: RequestUser, @Body() dto: PresignDto) {
    return this.documentsService.presignForUser(user.id, dto);
  }

  @Patch(':id/review')
  @Roles(Role.HR, Role.ADMIN)
  review(
    @Param('id') id: string,
    @GetUser() user: RequestUser,
    @Body() dto: UpdateDocumentStatusDto,
  ) {
    return this.documentsService.reviewDocument(
      id,
      user.id,
      dto.status,
      dto.comments,
    );
  }
}
