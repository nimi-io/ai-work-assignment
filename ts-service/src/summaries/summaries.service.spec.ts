import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { SummariesRepository } from './summaries.repository';
import { CandidatesRepository } from '../candidates/candidates.repository';
import { ProviderService } from '../summarization/providers/index.provider.service';
import { SummaryStatus } from '../shared/interface/index.interface';

const candidateId = 'cand-uuid';
const workspaceId = 'ws-uuid';
const summaryId = 'sum-uuid';

const mockCandidate = {
  id: candidateId,
  workspaceId,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  documents: [],
};

const mockSummary = {
  id: summaryId,
  candidateId,
  status: SummaryStatus.PENDING,
  score: null,
  strengths: null,
  concerns: null,
  summary: null,
  recommendedDecision: null,
  errorMessage: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('SummariesService', () => {
  let service: SummariesService;
  let summariesRepo: jest.Mocked<SummariesRepository>;
  let candidatesRepo: jest.Mocked<CandidatesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummariesService,
        {
          provide: SummariesRepository,
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: CandidatesRepository,
          useValue: {
            findOne: jest.fn(),
            findWithRelations: jest.fn(),
          },
        },
        {
          provide: ProviderService,
          useValue: { generateCandidateSummary: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SummariesService>(SummariesService);
    summariesRepo = module.get(SummariesRepository);
    candidatesRepo = module.get(CandidatesRepository);
  });

  describe('generate', () => {
    it('should create a pending summary record and return message with summaryId', async () => {
      candidatesRepo.findWithRelations.mockResolvedValue(mockCandidate as any);
      summariesRepo.create.mockResolvedValue(mockSummary as any);

      const result = await service.generate(candidateId, workspaceId);

      expect(candidatesRepo.findWithRelations).toHaveBeenCalledWith(
        { id: candidateId },
        ['documents'],
      );
      expect(summariesRepo.create).toHaveBeenCalledWith({
        candidateId,
        status: SummaryStatus.PENDING,
      });
      expect(result).toEqual({
        message: 'Summary generation queued',
        summaryId,
      });
    });

    it('should throw NotFoundException when the candidate does not exist', async () => {
      candidatesRepo.findWithRelations.mockResolvedValue(null);

      await expect(service.generate('missing', workspaceId)).rejects.toThrow(
        NotFoundException,
      );
      expect(summariesRepo.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when the candidate belongs to a different workspace', async () => {
      candidatesRepo.findWithRelations.mockResolvedValue({
        ...mockCandidate,
        workspaceId: 'other-ws',
      } as any);

      await expect(service.generate(candidateId, workspaceId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(summariesRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllForCandidate', () => {
    it('should return all summaries for a valid candidate', async () => {
      candidatesRepo.findOne.mockResolvedValue(mockCandidate as any);
      summariesRepo.find.mockResolvedValue([mockSummary as any]);

      const result = await service.findAllForCandidate(
        candidateId,
        workspaceId,
      );

      expect(summariesRepo.find).toHaveBeenCalledWith({ candidateId });
      expect(result).toEqual([mockSummary]);
    });

    it('should throw NotFoundException when the candidate does not exist', async () => {
      candidatesRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findAllForCandidate('missing', workspaceId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when the candidate belongs to a different workspace', async () => {
      candidatesRepo.findOne.mockResolvedValue({
        ...mockCandidate,
        workspaceId: 'other-ws',
      } as any);

      await expect(
        service.findAllForCandidate(candidateId, workspaceId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return the summary when candidate and summary are found', async () => {
      candidatesRepo.findOne.mockResolvedValue(mockCandidate as any);
      summariesRepo.findOne.mockResolvedValue(mockSummary as any);

      const result = await service.findOne(summaryId, candidateId, workspaceId);

      expect(summariesRepo.findOne).toHaveBeenCalledWith({
        id: summaryId,
        candidateId,
      });
      expect(result).toEqual(mockSummary);
    });

    it('should throw NotFoundException when the summary does not exist', async () => {
      candidatesRepo.findOne.mockResolvedValue(mockCandidate as any);
      summariesRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('missing-sum', candidateId, workspaceId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when the candidate does not exist', async () => {
      candidatesRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(summaryId, 'missing-cand', workspaceId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when the candidate belongs to a different workspace', async () => {
      candidatesRepo.findOne.mockResolvedValue({
        ...mockCandidate,
        workspaceId: 'other-ws',
      } as any);

      await expect(
        service.findOne(summaryId, candidateId, workspaceId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
