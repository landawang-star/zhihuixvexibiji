import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';

export function Toast() {
  const { toast, hideToast } = useUIStore();
  
  if (!toast) return null;
  
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };
  
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };
  
  const Icon = icons[toast.type];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className={cn(
          'fixed bottom-20 left-1/2 -translate-x-1/2 z-50',
          'flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg',
          'text-white font-medium',
          colors[toast.type]
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{toast.message}</span>
        <button 
          onClick={hideToast}
          className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
