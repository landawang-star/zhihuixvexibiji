import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, Note } from '@/types';
import { useNoteStore } from '@/stores/useNoteStore';
import { useUIStore } from '@/stores/useUIStore';
import { ConfirmModal } from '@/components/common/Modal';
import { NoteItem } from './NoteItem';

interface CategoryFolderProps {
  category: Category;
  notes: Note[];
  depth?: number;
}

export function CategoryFolder({ category, notes, depth = 0 }: CategoryFolderProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { currentCategory, setCurrentCategory, deleteCategory } = useNoteStore();
  const { showToast } = useUIStore();
  
  const categoryNotes = notes.filter((n: Note) => n.categoryId === category.id);
  const isActive = currentCategory?.id === category.id;
  
  const handleClick = () => {
    setCurrentCategory(category);
    setIsExpanded(!isExpanded);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (categoryNotes.length > 0) {
      showToast('请先删除该分类下的所有笔记', 'error');
      return;
    }
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    deleteCategory(category.id);
    showToast('分类已删除', 'success');
    setShowDeleteConfirm(false);
  };
  
  return (
    <>
      <div className="mb-0.5">
        <motion.button
          onClick={handleClick}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-2 rounded-xl transition-all duration-200 group',
            isActive 
              ? 'bg-white shadow-sm border border-indigo-100' 
              : 'hover:bg-white/40'
          )}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Expand Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 flex items-center justify-center text-gray-400"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.div>
          
          {/* Folder Icon */}
          <div className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center text-lg',
            isActive ? 'bg-indigo-100' : 'bg-white/50'
          )}>
            {category.emoji}
          </div>
          
          {/* Name */}
          <span className={cn(
            'flex-1 text-sm font-medium text-left',
            isActive ? 'text-indigo-700' : 'text-gray-700'
          )}>
            {category.name}
          </span>
          
          {/* Count */}
          <span className="text-xs text-gray-400">
            {categoryNotes.length}
          </span>
          
          {/* Delete Button */}
          <button
            onClick={handleDeleteClick}
            className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </motion.button>
        
        {/* Notes List */}
        <AnimatePresence>
          {isExpanded && categoryNotes.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-0.5 space-y-0.5">
                {categoryNotes.map((note: Note) => (
                  <NoteItem key={note.id} note={note} depth={depth + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="删除分类"
        message={`确定要删除分类 "${category.name}" 吗？此操作不可恢复！`}
      />
    </>
  );
}
