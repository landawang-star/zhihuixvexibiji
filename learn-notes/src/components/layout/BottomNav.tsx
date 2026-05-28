import { Home, FileText, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';

const navItems = [
  { icon: Home, label: '首页', value: 'home' as const },
  { icon: FileText, label: '笔记', value: 'notes' as const },
  { icon: Sparkles, label: 'AI助手', value: 'ai' as const },
  { icon: Settings, label: '设置', value: 'settings' as const },
];

export function BottomNav() {
  const { currentView, aiPanelOpen, toggleAIPanel, requestNavigate } = useUIStore();
  
  const handleClick = (value: typeof navItems[number]['value']) => {
    if (value === 'ai') {
      // AI 助手特殊处理：如果在笔记页面则切换 AI 面板，否则切换到笔记页面
      if (currentView === 'notes') {
        toggleAIPanel();
      } else {
        if (!requestNavigate('notes')) return;
        if (!aiPanelOpen) {
          toggleAIPanel();
        }
      }
    } else {
      requestNavigate(value);
    }
  };
  
  return (
    <nav className="h-16 bg-white border-t border-gray-100 flex items-center justify-around px-4 lg:hidden safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.value === 'ai' 
          ? aiPanelOpen || currentView === 'notes'
          : currentView === item.value;
        
        return (
          <button
            key={item.value}
            onClick={() => handleClick(item.value)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              isActive 
                ? 'text-indigo-600' 
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Icon className={cn('w-5 h-5', isActive && 'text-indigo-600')} />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
