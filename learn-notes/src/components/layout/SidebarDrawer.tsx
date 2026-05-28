import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/stores/useUIStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export function SidebarDrawer() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const isDesktop = useIsDesktop();
  
  // 桌面端不使用抽屉
  if (isDesktop) return null;
  
  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full z-50 lg:hidden"
          >
            <Sidebar />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
