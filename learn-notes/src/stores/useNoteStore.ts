import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, Category } from '@/types';
import { generateId, getCategoryEmoji } from '@/lib/utils';

interface NoteState {
  notes: Note[];
  categories: Category[];
  currentNote: Note | null;
  currentCategory: Category | null;
  
  // Actions
  setCurrentNote: (note: Note | null) => void;
  setCurrentCategory: (category: Category | null) => void;
  createNote: (categoryId: string, title?: string) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  createCategory: (name: string, parentId?: string | null) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  moveNote: (noteId: string, targetCategoryId: string) => void;
  searchNotes: (query: string) => Note[];
  getNotesByCategory: (categoryId: string) => Note[];
  toggleFavorite: (noteId: string) => void;
  getRecentNotes: (limit?: number) => Note[];
}

// 无初始数据 — 用户从空白开始
const initialCategories: Category[] = [];
const initialNotes: Note[] = [];

// 从服务器加载笔记
async function loadFromServer() {
  try {
    const resp = await fetch('/api/sync/load');
    const data = await resp.json();
    if (data.notes?.length > 0 || data.categories?.length > 0) return data;
  } catch {}
  return null;
}

// 同步到服务器（防抖 1 秒）
let syncTimer: ReturnType<typeof setTimeout> | null = null;
function syncToServer(notes: Note[], categories: Category[]) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, categories }),
      });
    } catch {}
  }, 1000);
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: initialNotes,
      categories: initialCategories,
      currentNote: null,
      currentCategory: null,
      
      setCurrentNote: (note) => set({ currentNote: note }),
      setCurrentCategory: (category) => set({ currentCategory: category }),
      
      createNote: (categoryId, title) => {
        const newNote: Note = {
          id: generateId(),
          title: title || '未命名笔记',
          content: '',
          categoryId,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isFavorite: false,
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
        return newNote;
      },
      
      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
          currentNote: state.currentNote?.id === id
            ? { ...state.currentNote, ...updates, updatedAt: new Date() }
            : state.currentNote,
        }));
      },
      
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
        }));
      },
      
      createCategory: (name, parentId = null) => {
        const newCategory: Category = {
          id: generateId(),
          name,
          emoji: getCategoryEmoji(name),
          parentId,
          order: get().categories.length,
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
        return newCategory;
      },
      
      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        }));
      },
      
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          notes: state.notes.filter((note) => note.categoryId !== id),
        }));
      },
      
      moveNote: (noteId, targetCategoryId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId ? { ...note, categoryId: targetCategoryId } : note
          ),
        }));
      },
      
      searchNotes: (query) => {
        const { notes } = get();
        if (!query.trim()) return notes;
        const lowerQuery = query.toLowerCase();
        return notes.filter(
          (note) =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery)
        );
      },
      
      getNotesByCategory: (categoryId) => {
        return get().notes.filter((note) => note.categoryId === categoryId);
      },
      
      toggleFavorite: (noteId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
          ),
          currentNote: state.currentNote?.id === noteId
            ? { ...state.currentNote, isFavorite: !state.currentNote.isFavorite }
            : state.currentNote,
        }));
      },
      
      getRecentNotes: (limit = 5) => {
        return [...get().notes]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },
    }),
    {
      name: 'learn-notes-storage',
      version: 3,
    }
  )
);

// 启动时从服务器恢复数据
loadFromServer().then((serverData) => {
  if (serverData) {
    useNoteStore.setState({
      notes: serverData.notes,
      categories: serverData.categories,
    });
  }
});

// 自动同步到服务器（每次变化后保存）
useNoteStore.subscribe((state) => {
  syncToServer(state.notes, state.categories);
});
