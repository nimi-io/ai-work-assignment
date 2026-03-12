import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  ICandidateDocument,
  DocumentType,
} from 'src/shared/interface/index.interface';
import { Candidate } from 'src/candidates/entities/candidate.entity';

@Entity('candidate_documents')
@Index(['candidateId'])
export class CandidateDocument implements ICandidateDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  candidateId: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.RESUME,
  })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  storageKey: string;

  @Column({ type: 'text' })
  rawText: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // relations
  @ManyToOne(() => Candidate, (candidate) => candidate.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;
}
