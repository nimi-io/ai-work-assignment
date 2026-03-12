import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../shared/common/abstract/abstract.service';
import { Workspace } from './entities/workspace.entity';

@Injectable()
export class WorkspacesRepository extends AbstractRepository<Workspace> {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
  ) {
    super(workspaceRepo);
  }
}
