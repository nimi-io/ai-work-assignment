// ─── Pagination ──────────────────────────────────────────────────────────────

export interface IPaginateResult<T> {
  data: T;
  meta: IMeta;
}

export interface IDefaultOptions {
  limit: number;
  page: number;
}

export interface IMeta {
  totalItems: number;
  count: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface IGetMetaProps {
  total: number;
  data: unknown[];
  limit: number;
  page: number;
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export interface IWorkspace {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Candidate ───────────────────────────────────────────────────────────────

export interface ICandidate {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Document ────────────────────────────────────────────────────────────────

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
}

// ─── Summary ─────────────────────────────────────────────────────────────────

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

// ─── Summarization Provider ──────────────────────────────────────────────────

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
