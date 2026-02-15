import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateDocumentDto } from './dto/create-document.dto';
import { PresignDto } from './dto/presign.dto';

interface RequestUser {
  id: string;
}

@Controller('documents')
@UseGuards(JwtAuthGuard)
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
}
