export interface IPaginateResult<T> {
  data: T;
  meta: IMeta;
}

export interface IDefaultOptions {
  limit: number;
  page: number;
}

export interface IDefaultPaginationOptions {
  limit: number;
  page: number;
  sort: Record<string, 'ASC' | 'DESC'>;
}

export interface IMeta {
  total: number;
  limit: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IGetMetaProps {
  total: number;
  limit: number;
  page: number;
}

export interface IWorkspace {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICandidate {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  OTHER = 'other',
}

export interface ICandidateDocument {
  id: string;
  candidateId: string;
  documentType: DocumentType;
  fileName: string;
  storageKey: string;
  rawText: string;
  uploadedAt: Date;
  createdAt: Date;
}

export enum SummaryStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum RecommendedDecision {
  ADVANCE = 'advance',
  HOLD = 'hold',
  REJECT = 'reject',
}

export interface ICandidateSummary {
  id: string;
  candidateId: string;
  status: SummaryStatus;
  score: number | null;
  strengths: string[] | null;
  concerns: string[] | null;
  summary: string | null;
  recommendedDecision: RecommendedDecision | null;
  provider: string | null;
  promptVersion: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SummarizationInput {
  candidateId: string;
  documents: { type: string; rawText: string }[];
}

export interface SummarizationResult {
  score: number;
  strengths: string[];
  concerns: string[];
  summary: string;
  recommendedDecision: 'advance' | 'hold' | 'reject';
}

export interface ISummarizationProvider {
  generateCandidateSummary(
    input: SummarizationInput,
  ): Promise<SummarizationResult>;
}
