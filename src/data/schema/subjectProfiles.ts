import type { SubjectCode } from '@/types';
import type { SubjectSchemaProfile } from './types';

const profiles: Record<SubjectCode, SubjectSchemaProfile> = {
  math: {
    kind: 'mathematics',
    dimensions: ['concept', 'procedure', 'reasoning', 'modeling'],
    supportedEvidence: ['symbolic_work', 'proof', 'graph', 'numeric_answer'],
  },
  english: {
    kind: 'language',
    dimensions: ['language_knowledge', 'reading', 'listening', 'writing', 'communication'],
    supportedEvidence: ['selected_response', 'constructed_response', 'passage_evidence', 'audio_evidence'],
  },
  physics: {
    kind: 'science',
    dimensions: ['concept', 'calculation', 'model', 'experiment'],
    supportedEvidence: ['unit_aware_number', 'diagram', 'data_table', 'experimental_reasoning'],
  },
  chemistry: {
    kind: 'science',
    dimensions: ['concept', 'reaction', 'calculation', 'experiment'],
    supportedEvidence: ['chemical_equation', 'unit_aware_number', 'data_table', 'lab_safety'],
  },
  biology: {
    kind: 'science',
    dimensions: ['concept', 'mechanism', 'data', 'experiment'],
    supportedEvidence: ['causal_explanation', 'diagram', 'data_table', 'experimental_reasoning'],
  },
  history: {
    kind: 'humanities',
    dimensions: ['chronology', 'causation', 'comparison', 'source_analysis'],
    supportedEvidence: ['timeline', 'source_evidence', 'argument', 'selected_response'],
  },
};

export function subjectSchemaFor(subject: SubjectCode): SubjectSchemaProfile {
  return profiles[subject];
}
