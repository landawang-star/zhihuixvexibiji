import { Menu, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/useUIStore';

export function MobileHeader() {
  const { toggleSidebar, requestNavigate } = useUIStore();
  
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:hidden">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="w-5 h-5" />
      </Button>
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          ✨
        </div>
        <span className="font-semibold text-gray-800">智学笔记</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => requestNavigate('settings')}>
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
