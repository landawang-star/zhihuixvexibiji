import type { KnowledgePoint } from './index';

export interface AnalysisResult {
  title: string;
  knowledgePoints: KnowledgePoint[];
}

export type AnalysisStage = 'idle' | 'analyzing' | 'done' | 'error';
