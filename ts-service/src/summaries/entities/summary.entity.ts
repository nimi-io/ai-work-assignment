/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ICandidateSummary,
  SummaryStatus,
  RecommendedDecision,
} from '../../shared/interface/index.interface';
import { Candidate } from '../../candidates/entities/candidate.entity';

@Entity('candidate_summaries')
@Index(['candidateId'])
@Index(['status'])
export class CandidateSummary implements ICandidateSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  candidateId: string;

  @Column({
    type: 'enum',
    enum: SummaryStatus,
    default: SummaryStatus.PENDING,
  })
  status: SummaryStatus;

  @Column({ type: 'float', nullable: true })
  score: number | null;

  @Column({ type: 'text', array: true, nullable: true })
  strengths: string[] | null;

  @Column({ type: 'text', array: true, nullable: true })
  concerns: string[] | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({
    type: 'enum',
    enum: RecommendedDecision,
    nullable: true,
  })
  recommendedDecision: RecommendedDecision | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  promptVersion: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // relations
  @ManyToOne(() => Candidate, (candidate) => candidate.summaries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;
}
