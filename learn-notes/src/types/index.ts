export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  progress?: number;
  // 视频笔记扩展字段
  sourceType?: 'video-upload';
  sourceUrl?: string;
  knowledgePoints?: KnowledgePoint[];
}

export interface KnowledgePoint {
  title: string;
  concepts: string[];
  explanation: string;
  timestamp?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  parentId: string | null;
  order: number;
  children?: Category[];
  noteCount?: number;
}

export interface AIAnalysis {
  id: string;
  noteId: string;
  type: 'structure' | 'knowledge' | 'mindmap' | 'suggestions';
  content: any;
  createdAt: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}
