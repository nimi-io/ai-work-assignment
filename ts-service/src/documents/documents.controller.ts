import { Controller, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CurrentUser } from '../auth/auth-user.decorator';
import { AuthUser } from '../auth/auth.types';

@ApiTags('Documents')
@Controller('candidates/:candidateId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a document for a candidate' })
  @ApiParam({ name: 'candidateId', description: 'UUID of the candidate' })
  @ApiCreatedResponse({ description: 'Document record created successfully' })
  @ApiNotFoundResponse({ description: 'Candidate not found' })
  @ApiForbiddenResponse({
    description: 'Candidate does not belong to this workspace',
  })
  create(
    @Param('candidateId') candidateId: string,
    @Body() dto: CreateDocumentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.documentsService.create(candidateId, dto, user.workspaceId);
  }
}
