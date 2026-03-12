import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentsRepository } from './documents.repository';
import { CandidatesRepository } from '../candidates/candidates.repository';
import { CandidateDocument } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly candidatesRepository: CandidatesRepository,
  ) {}

  async create(
    candidateId: string,
    dto: CreateDocumentDto,
    workspaceId: string,
  ): Promise<CandidateDocument> {
    const candidate = await this.candidatesRepository.findOne({
      id: candidateId,
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (candidate.workspaceId !== workspaceId) {
      throw new ForbiddenException(
        'Candidate does not belong to this workspace',
      );
    }
    return this.documentsRepository.create({ ...dto, candidateId });
  }
}
