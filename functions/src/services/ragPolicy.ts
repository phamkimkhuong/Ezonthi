export const RAG_CONTRACT_VERSION = 'rag-v2';
export const DEFAULT_RAG_CONTENT_VERSION = '2026.09';

export interface RagScope {
  gradeId: string;
  subjectId: string;
  contentVersion: string;
}

export interface RagCandidate extends RagScope {
  id: string;
  title: string;
  content: string;
  status: 'published' | 'draft' | 'retired';
  sourceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  sourceLocator: string;
  chunkType?: string;
  parentTitle?: string;
  keywords?: string[];
}

export interface RagProvenance {
  documentId: string;
  gradeId: string;
  subjectId: string;
  contentVersion: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  sourceLocator: string;
  retrieval: string;
}

export function validateRagScope(scope: Partial<RagScope>): scope is RagScope {
  return typeof scope.gradeId === 'string' && /^grade(?:9|10|11)$/.test(scope.gradeId) &&
    typeof scope.subjectId === 'string' && ['math', 'english', 'physics', 'chemistry', 'biology', 'history'].includes(scope.subjectId) &&
    typeof scope.contentVersion === 'string' && /^[A-Za-z0-9._-]{1,40}$/.test(scope.contentVersion);
}

export function candidateMatchesScope(candidate: Partial<RagCandidate>, scope: RagScope): candidate is RagCandidate {
  return candidate.gradeId === scope.gradeId && candidate.subjectId === scope.subjectId &&
    candidate.contentVersion === scope.contentVersion && candidate.status === 'published' &&
    typeof candidate.id === 'string' && candidate.id.length > 0 &&
    typeof candidate.title === 'string' && candidate.title.length > 0 &&
    typeof candidate.content === 'string' && candidate.content.length > 0 && candidate.content.length <= 12_000 &&
    typeof candidate.sourceId === 'string' && candidate.sourceId.length > 0 &&
    typeof candidate.sourceTitle === 'string' && candidate.sourceTitle.length > 0 &&
    typeof candidate.sourceLocator === 'string' && candidate.sourceLocator.length > 0;
}

export function buildRagProvenance(candidate: RagCandidate, retrieval: string): RagProvenance {
  return {
    documentId: candidate.id,
    gradeId: candidate.gradeId,
    subjectId: candidate.subjectId,
    contentVersion: candidate.contentVersion,
    sourceId: candidate.sourceId,
    sourceTitle: candidate.sourceTitle,
    ...(candidate.sourceUrl ? { sourceUrl: candidate.sourceUrl } : {}),
    sourceLocator: candidate.sourceLocator,
    retrieval,
  };
}

const normalize = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function lexicalRagRelevance(query: string, candidate: RagCandidate): number {
  const terms = new Set(normalize(query).split(/[^a-z0-9]+/).filter(term => term.length >= 3));
  if (terms.size === 0) return 0;
  const haystack = normalize(`${candidate.title} ${candidate.parentTitle ?? ''} ${candidate.content}`);
  return [...terms].filter(term => haystack.includes(term)).length / terms.size;
}

export function evaluateRagCandidate(query: string, candidate: Partial<RagCandidate>, scope: Partial<RagScope>) {
  if (!validateRagScope(scope)) return { accepted: false, reason: 'context_missing', score: 0 } as const;
  if (!candidateMatchesScope(candidate, scope)) return { accepted: false, reason: 'scope_or_provenance_mismatch', score: 0 } as const;
  const score = lexicalRagRelevance(query, candidate);
  return { accepted: score > 0, reason: score > 0 ? 'relevant' : 'irrelevant', score } as const;
}
