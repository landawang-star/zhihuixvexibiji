import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { useNoteStore } from '@/stores/useNoteStore';
import { CategoryFolder } from './CategoryFolder';

export function CategoryTree() {
  const { categories, notes } = useNoteStore();
  
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <FolderOpen className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">还没有分类</p>
        <p className="text-xs text-gray-400 mt-1">点击上方按钮创建</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CategoryFolder category={category} notes={notes} />
        </motion.div>
      ))}
    </div>
  );
}
