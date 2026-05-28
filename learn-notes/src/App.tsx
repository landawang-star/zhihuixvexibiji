import { AppLayout } from '@/components/layout/AppLayout';
import { NoteEditor } from '@/components/editor/NoteEditor';
import { Toast } from '@/components/common/Toast';
import { SidebarDrawer } from '@/components/layout/SidebarDrawer';
import { HomePage } from '@/components/pages/HomePage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { useUIStore } from '@/stores/useUIStore';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { currentView } = useUIStore();
  
  return (
    <>
      <AppLayout>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {currentView === 'home' && <HomePage />}
            {currentView === 'notes' && <NoteEditor />}
            {currentView === 'ai' && <NoteEditor />}
            {currentView === 'settings' && <SettingsPage />}
          </motion.div>
        </AnimatePresence>
      </AppLayout>
      <SidebarDrawer />
      <Toast />
    </>
  );
}

export default App;
