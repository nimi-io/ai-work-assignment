import { Test, TestingModule } from '@nestjs/testing';
import { SummariesController } from './summaries.controller';
import { SummariesService } from './summaries.service';
import { AuthUser } from '../auth/auth.types';
import { SummaryStatus } from '../shared/interface/index.interface';

const authUser: AuthUser = { userId: 'user-uuid', workspaceId: 'ws-uuid' };

const mockSummary = {
  id: 'sum-uuid',
  candidateId: 'cand-uuid',
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

describe('SummariesController', () => {
  let controller: SummariesController;
  let service: jest.Mocked<SummariesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummariesController],
      providers: [
        {
          provide: SummariesService,
          useValue: {
            generate: jest.fn(),
            findAllForCandidate: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SummariesController>(SummariesController);
    service = module.get(SummariesService);
  });

  describe('POST /:candidateId/summaries/generate (generate)', () => {
    it('should call service.generate and return the queued message with summaryId', async () => {
      const expected = {
        message: 'Summary generation queued',
        summaryId: 'sum-uuid',
      };
      service.generate.mockResolvedValue(expected);

      const result = await controller.generate('cand-uuid', authUser);

      expect(service.generate).toHaveBeenCalledWith('cand-uuid', 'ws-uuid');
      expect(result).toEqual(expected);
    });
  });

  describe('GET /:candidateId/summaries (findAll)', () => {
    it('should call service.findAllForCandidate and return all summaries', async () => {
      service.findAllForCandidate.mockResolvedValue([mockSummary as any]);

      const result = await controller.findAll('cand-uuid', authUser);

      expect(service.findAllForCandidate).toHaveBeenCalledWith(
        'cand-uuid',
        'ws-uuid',
      );
      expect(result).toEqual([mockSummary]);
    });
  });

  describe('GET /:candidateId/summaries/:summaryId (findOne)', () => {
    it('should call service.findOne and return the matching summary', async () => {
      service.findOne.mockResolvedValue(mockSummary as any);

      const result = await controller.findOne(
        'cand-uuid',
        'sum-uuid',
        authUser,
      );

      expect(service.findOne).toHaveBeenCalledWith(
        'sum-uuid',
        'cand-uuid',
        'ws-uuid',
      );
      expect(result).toEqual(mockSummary);
    });
  });
});
