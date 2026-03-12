import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesRepository } from './workspaces.repository';
import { Workspace } from './entities/workspace.entity';

const mockWorkspace: Workspace = {
  id: 'ws-uuid',
  name: 'Acme Corp',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as Workspace;

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let repo: jest.Mocked<WorkspacesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: WorkspacesRepository,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    repo = module.get(WorkspacesRepository);
  });

  describe('create', () => {
    it('should call repository.create with the dto and return the workspace', async () => {
      repo.create.mockResolvedValue(mockWorkspace);

      const result = await service.create({ name: 'Acme Corp' });

      expect(repo.create).toHaveBeenCalledWith({ name: 'Acme Corp' });
      expect(result).toEqual(mockWorkspace);
    });
  });
});
