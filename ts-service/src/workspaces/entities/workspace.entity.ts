import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IWorkspace } from '../../shared/interface/index.interface';
import { Candidate } from '../../candidates/entities/candidate.entity';

@Entity('workspaces')
export class Workspace implements IWorkspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // relations
  @OneToMany(() => Candidate, (candidate) => candidate.workspace)
  candidates: Candidate[];
}
