import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { AuthUser } from '../auth/auth.types';
import { Candidate } from './entities/candidate.entity';

const authUser: AuthUser = { userId: 'user-uuid', workspaceId: 'ws-uuid' };

const mockCandidate: Candidate = {
  id: 'cand-uuid',
  workspaceId: 'ws-uuid',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as Candidate;

describe('CandidatesController', () => {
  let controller: CandidatesController;
  let service: jest.Mocked<CandidatesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatesController],
      providers: [
        {
          provide: CandidatesService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CandidatesController>(CandidatesController);
    service = module.get(CandidatesService);
  });

  describe('POST / (create)', () => {
    it('should merge workspaceId from the auth user into the dto and call service.create', async () => {
      service.create.mockResolvedValue(mockCandidate);
      const dto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      };

      const result = await controller.create(dto, authUser);

      expect(service.create).toHaveBeenCalledWith({
        ...dto,
        workspaceId: 'ws-uuid',
      });
      expect(result).toEqual(mockCandidate);
    });
  });

  describe('GET /:candidateId (findOne)', () => {
    it('should call service.findOne with candidateId and workspaceId from the auth user', async () => {
      service.findOne.mockResolvedValue(mockCandidate);

      const result = await controller.findOne('cand-uuid', authUser);

      expect(service.findOne).toHaveBeenCalledWith('cand-uuid', 'ws-uuid');
      expect(result).toEqual(mockCandidate);
    });
  });
});
