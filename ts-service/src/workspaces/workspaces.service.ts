import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspacesRepository } from './workspaces.repository';
import { Workspace } from './entities/workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(private readonly workspacesRepository: WorkspacesRepository) {}

  create(dto: CreateWorkspaceDto): Promise<Workspace> {
    return this.workspacesRepository.create(dto);
  }
}
