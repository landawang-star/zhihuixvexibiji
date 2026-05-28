import { FileText, Plus, FolderPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/common/Modal';
import { useNoteStore } from '@/stores/useNoteStore';
import { useUIStore } from '@/stores/useUIStore';
import { useState } from 'react';

export function EmptyState() {
  const { createNote, createCategory, setCurrentNote, currentCategory, categories } = useNoteStore();
  const { showToast } = useUIStore();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'note' | 'category'>('note');
  
  const handleOpenModal = (type: 'note' | 'category') => {
    setModalType(type);
    setShowModal(true);
  };
  
  const handleCreateNote = (title: string) => {
    if (categories.length === 0) {
      showToast('请先创建一个分类', 'info');
      return;
    }
    const categoryId = currentCategory?.id || categories[0]?.id || '';
    const note = createNote(categoryId, title);
    setCurrentNote(note);
    showToast('笔记创建成功！', 'success');
  };
  
  const handleCreateCategory = (name: string) => {
    createCategory(name);
    showToast('分类创建成功！', 'success');
  };
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full text-center p-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-indigo-400" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          还没有选择笔记
        </h3>
        
        <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
          {categories.length === 0 
            ? '先创建一个分类，然后开始记录你的学习笔记'
            : '从左侧目录选择一个笔记开始编辑，或者创建一篇新笔记'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => handleOpenModal('note')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建新笔记
          </Button>
          {categories.length === 0 && (
            <Button 
              variant="outline"
              className="border-gray-200 hover:bg-white"
              onClick={() => handleOpenModal('category')}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              创建分类
            </Button>
          )}
        </div>
      </motion.div>
      
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={modalType === 'note' ? handleCreateNote : handleCreateCategory}
        title={modalType === 'note' ? '新建笔记' : '新建分类'}
        placeholder={modalType === 'note' ? '输入笔记名称' : '输入分类名称'}
        confirmText={modalType === 'note' ? '创建笔记' : '创建分类'}
      />
    </>
  );
}
