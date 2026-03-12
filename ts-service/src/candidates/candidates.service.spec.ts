import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesRepository } from './candidates.repository';
import { Candidate } from './entities/candidate.entity';

const mockCandidate: Candidate = {
  id: 'cand-uuid',
  workspaceId: 'ws-uuid',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as Candidate;

describe('CandidatesService', () => {
  let service: CandidatesService;
  let repo: jest.Mocked<CandidatesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: CandidatesRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
    repo = module.get(CandidatesRepository);
  });

  describe('create', () => {
    it('should call repository.create and return the new candidate', async () => {
      repo.create.mockResolvedValue(mockCandidate);
      const dto = {
        workspaceId: 'ws-uuid',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      };

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCandidate);
    });
  });

  describe('findOne', () => {
    it('should return the candidate when found and workspace matches', async () => {
      repo.findOne.mockResolvedValue(mockCandidate);

      const result = await service.findOne('cand-uuid', 'ws-uuid');

      expect(repo.findOne).toHaveBeenCalledWith({ id: 'cand-uuid' });
      expect(result).toEqual(mockCandidate);
    });

    it('should throw NotFoundException when the candidate does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id', 'ws-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when the candidate belongs to a different workspace', async () => {
      repo.findOne.mockResolvedValue(mockCandidate);

      await expect(service.findOne('cand-uuid', 'other-ws')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
