import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Star, Trash2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Note } from '@/types';
import { useNoteStore } from '@/stores/useNoteStore';
import { useUIStore } from '@/stores/useUIStore';
import { ConfirmModal } from '@/components/common/Modal';

interface NoteItemProps {
  note: Note;
  depth?: number;
}

export function NoteItem({ note, depth = 0 }: NoteItemProps) {
  const { currentNote, setCurrentNote, toggleFavorite, deleteNote } = useNoteStore();
  const { setCurrentView, showToast } = useUIStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isActive = currentNote?.id === note.id;
  
  const handleClick = () => {
    setCurrentNote(note);
    setCurrentView('notes');
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(note.id);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    deleteNote(note.id);
    showToast('笔记已删除', 'success');
    setShowDeleteConfirm(false);
  };
  
  // 提取纯文本预览
  const getPreview = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.slice(0, 50) + (text.length > 50 ? '...' : '');
  };
  
  return (
    <>
      <motion.button
        onClick={handleClick}
        className={cn(
          'w-full flex items-start gap-2 px-2 py-2.5 rounded-xl transition-all duration-200 group text-left',
          isActive 
            ? 'bg-indigo-50 border border-indigo-200' 
            : 'hover:bg-white/40 border border-transparent'
        )}
        style={{ paddingLeft: `${depth * 12 + 24}px` }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Icon */}
        <div className={cn(
          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
          isActive ? 'text-indigo-500' : 'text-gray-400'
        )}>
          <FileText className="w-4 h-4" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'text-sm font-medium truncate flex-1',
              isActive ? 'text-indigo-700' : 'text-gray-700'
            )}>
              {note.title}
            </span>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-0.5">
              {/* Favorite Button */}
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  'p-1 rounded transition-colors opacity-0 group-hover:opacity-100',
                  note.isFavorite 
                    ? 'text-yellow-500 opacity-100' 
                    : 'text-gray-300 hover:text-yellow-400'
                )}
              >
                <Star 
                  className={cn('w-3.5 h-3.5', note.isFavorite && 'fill-current')} 
                />
              </button>
              
              {/* Delete Button */}
              <button
                onClick={handleDeleteClick}
                className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Preview */}
          {note.content && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {getPreview(note.content)}
            </p>
          )}
          
          {/* Date */}
          <p className="text-[10px] text-gray-400 mt-1">
            {formatDate(note.updatedAt)}
          </p>
        </div>
      </motion.button>
      
      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="删除笔记"
        message={`确定要删除笔记 "${note.title}" 吗？此操作不可恢复！`}
      />
    </>
  );
}
