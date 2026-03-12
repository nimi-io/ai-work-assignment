import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { Workspace } from './entities/workspace.entity';

const mockWorkspace: Workspace = {
  id: 'ws-uuid',
  name: 'Test Workspace',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as Workspace;

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let service: jest.Mocked<WorkspacesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    service = module.get(WorkspacesService);
  });

  describe('POST / (create)', () => {
    it('should call service.create with the dto and return the result', async () => {
      service.create.mockResolvedValue(mockWorkspace);
      const dto = { name: 'Test Workspace' };

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockWorkspace);
    });
  });
});
