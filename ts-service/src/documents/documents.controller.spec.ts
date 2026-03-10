import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { AuthUser } from '../auth/auth.types';
import { DocumentType } from '../shared/interface/index.interface';
import { CreateDocumentDto } from './dto/create-document.dto';

const authUser: AuthUser = { userId: 'user-uuid', workspaceId: 'ws-uuid' };

const createDto: CreateDocumentDto = {
  documentType: DocumentType.RESUME,
  fileName: 'cv.pdf',
  storageKey: 'uploads/cv.pdf',
  rawText: 'Experienced backend engineer.',
};

const mockDocument = {
  id: 'doc-uuid',
  candidateId: 'cand-uuid',
  ...createDto,
  uploadedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
};

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: jest.Mocked<DocumentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get(DocumentsService);
  });

  describe('POST /:candidateId/documents (create)', () => {
    it('should call service.create with candidateId, dto, and workspaceId from the auth user', async () => {
      service.create.mockResolvedValue(mockDocument as any);

      const result = await controller.create('cand-uuid', createDto, authUser);

      expect(service.create).toHaveBeenCalledWith(
        'cand-uuid',
        createDto,
        'ws-uuid',
      );
      expect(result).toEqual(mockDocument);
    });
  });
});
