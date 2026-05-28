import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewType = 'home' | 'notes' | 'ai' | 'settings';

export interface UserSettings {
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
}

interface UIState {
  // 当前视图
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  
  // 未保存更改检测
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (v: boolean) => void;
  // 请求导航（带未保存检测）：返回 true 表示可以导航，false 表示被拦截
  requestNavigate: (view: ViewType) => boolean;
  // 待处理的导航目标
  pendingView: ViewType | null;
  setPendingView: (view: ViewType | null) => void;
  
  // 侧边栏
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // AI 面板
  aiPanelOpen: boolean;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  
  // 快速访问面板
  quickAccessPanel: 'recent' | 'stats' | 'favorites' | null;
  setQuickAccessPanel: (panel: 'recent' | 'stats' | 'favorites' | null) => void;
  
  // 搜索
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // 加载状态
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // 通知
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  
  // 用户设置
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  fontSize: 'medium',
  sidebarCollapsed: false,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentView: 'home',
      setCurrentView: (view) => set({ currentView: view, hasUnsavedChanges: false }),
      
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (v) => set({ hasUnsavedChanges: v }),
      pendingView: null,
      setPendingView: (view) => set({ pendingView: view }),
      requestNavigate: (view) => {
        const state = useUIStore.getState();
        if (state.hasUnsavedChanges) {
          set({ pendingView: view });
          return false;
        }
        set({ currentView: view });
        return true;
      },
      
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      aiPanelOpen: false,
      toggleAIPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
      setAIPanelOpen: (open) => set({ aiPanelOpen: open }),
      
      quickAccessPanel: null,
      setQuickAccessPanel: (panel) => set((state) => ({
        quickAccessPanel: state.quickAccessPanel === panel ? null : panel,
      })),
      
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      toast: null,
      showToast: (message, type = 'info') => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3000);
      },
      hideToast: () => set({ toast: null }),
      
      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'learn-notes-ui-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
