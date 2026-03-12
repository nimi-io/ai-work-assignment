import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsRepository } from './documents.repository';
import { CandidatesRepository } from '../candidates/candidates.repository';
import { DocumentType } from '../shared/interface/index.interface';
import { CreateDocumentDto } from './dto/create-document.dto';

const candidateId = 'cand-uuid';
const workspaceId = 'ws-uuid';

const createDto: CreateDocumentDto = {
  documentType: DocumentType.RESUME,
  fileName: 'jane_resume.pdf',
  storageKey: 'uploads/jane_resume.pdf',
  rawText: 'Jane has 5 years of experience in engineering.',
};

const mockDocument = {
  id: 'doc-uuid',
  candidateId,
  ...createDto,
  uploadedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  let docsRepo: jest.Mocked<DocumentsRepository>;
  let candsRepo: jest.Mocked<CandidatesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: DocumentsRepository,
          useValue: { create: jest.fn() },
        },
        {
          provide: CandidatesRepository,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    docsRepo = module.get(DocumentsRepository);
    candsRepo = module.get(CandidatesRepository);
  });

  describe('create', () => {
    it('should create and return a document when the candidate exists and belongs to the workspace', async () => {
      candsRepo.findOne.mockResolvedValue({
        id: candidateId,
        workspaceId,
      } as any);
      docsRepo.create.mockResolvedValue(mockDocument as any);

      const result = await service.create(candidateId, createDto, workspaceId);

      expect(candsRepo.findOne).toHaveBeenCalledWith({ id: candidateId });
      expect(docsRepo.create).toHaveBeenCalledWith({
        ...createDto,
        candidateId,
      });
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException when the candidate does not exist', async () => {
      candsRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create('missing', createDto, workspaceId),
      ).rejects.toThrow(NotFoundException);

      expect(docsRepo.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when the candidate belongs to a different workspace', async () => {
      candsRepo.findOne.mockResolvedValue({
        id: candidateId,
        workspaceId: 'other-ws',
      } as any);

      await expect(
        service.create(candidateId, createDto, workspaceId),
      ).rejects.toThrow(ForbiddenException);

      expect(docsRepo.create).not.toHaveBeenCalled();
    });
  });
});
