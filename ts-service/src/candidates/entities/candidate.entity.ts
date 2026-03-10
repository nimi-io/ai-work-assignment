import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ICandidate } from '../../shared/interface/index.interface';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { CandidateDocument } from '../../documents/entities/document.entity';
import { CandidateSummary } from '../../summaries/entities/summary.entity';

@Entity('candidates')
@Index(['workspaceId'])
export class Candidate implements ICandidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // relations
  @ManyToOne(() => Workspace, (workspace) => workspace.candidates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @OneToMany(() => CandidateDocument, (document) => document.candidate)
  documents: CandidateDocument[];

  @OneToMany(() => CandidateSummary, (summary) => summary.candidate)
  summaries: CandidateSummary[];
}
