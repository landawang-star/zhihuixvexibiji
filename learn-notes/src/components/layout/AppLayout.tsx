import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {isDesktop && <Sidebar />}
      
      <div className="flex-1 flex flex-col min-w-0">
        {!isDesktop && <MobileHeader />}
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        
        {!isDesktop && <BottomNav />}
      </div>
    </div>
  );
}
